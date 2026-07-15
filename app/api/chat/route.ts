/**
 * WHY THIS FILE EXISTS
 * -------------------
 * POST /api/chat — The main chat endpoint. This is the API that the embed widget
 * and playground UI call to send messages and receive streaming responses.
 *
 * Request flow:
 *  1. Parse and validate the request body (botPublicId, messages, sessionId)
 *  2. Look up the bot config (model, system prompt, temperature)
 *  3. Retrieve relevant document chunks via RAG
 *  4. Build the augmented system prompt with retrieved context
 *  5. Stream the AI response back via Server-Sent Events (SSE)
 *  6. Save the user message + assistant response to the database
 *  7. Update conversation stats (message count, token usage)
 *
 * Authentication: This endpoint is called by the embed widget (which doesn't
 * have a Clerk session) AND the dashboard (which does). Authentication is
 * handled via a signed embed token for widget requests, and Clerk session
 * for dashboard requests. Both paths resolve to a `botPublicId`.
 *
 * Rate limiting: Per-bot rate limiting is enforced here via the bot's
 * `rateLimitPerMinute` setting.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatStream } from "@/services/ai/chat";
import {
  retrieveRelevantChunks,
  buildRagPrompt,
} from "@/services/ai/retrieval";
import { createLogger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

const log = createLogger("api/chat");

interface ChatRequest {
  botPublicId: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  sessionId?: string;
  endUserToken?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.botPublicId || !body.messages?.length) {
      return Response.json(
        { error: "botPublicId and messages are required" },
        { status: 400 },
      );
    }

    // Step 1: Look up bot configuration
    const bot = await prisma.bot.findUnique({
      where: { publicId: body.botPublicId },
      select: {
        id: true,
        workspaceId: true,
        status: true,
        modelProvider: true,
        modelId: true,
        temperature: true,
        systemPrompt: true,
        persona: true,
        language: true,
        rateLimitPerMinute: true,
        greeting: true,
      },
    });

    if (!bot) {
      return Response.json({ error: "Bot not found" }, { status: 404 });
    }

    if (bot.status !== "ACTIVE") {
      return Response.json(
        { error: "Bot is not active" },
        { status: 403 },
      );
    }

    // Rate limit per end-user (falls back to IP).
    // Keys on botId + endUserToken so each visitor gets their own bucket;
    // if end-user identity isn't provided, we fall back to the client IP.
    const endUserKey =
      body.endUserToken ??
      request.headers.get("x-forwarded-for")?.split(",")[0] ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const rl = await rateLimit(`chat:${bot.id}:${endUserKey}`, {
      windowMs: 60_000,
      max: bot.rateLimitPerMinute,
    });

    if (!rl.allowed) {
      const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000);
      return Response.json(
        { error: "Rate limit exceeded. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(retryAfter, 1)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rl.reset),
          },
        },
      );
    }

    // Step 2: Get the latest user message for RAG retrieval
    const lastUserMessage = body.messages
      .filter((m) => m.role === "user")
      .pop();

    if (!lastUserMessage) {
      return Response.json(
        { error: "At least one user message is required" },
        { status: 400 },
      );
    }

    // Step 3: RAG retrieval
    let retrievedChunks: Awaited<ReturnType<typeof retrieveRelevantChunks>> = [];
    try {
      retrievedChunks = await retrieveRelevantChunks(bot.id, lastUserMessage.content, 5);
      log.info("RAG retrieval completed", { chunksFound: retrievedChunks.length, botId: bot.id });
    } catch (err) {
      log.error("RAG retrieval failed, proceeding without context", { error: String(err) });
      retrievedChunks = [];
    }

    // Step 4: Build the RAG-augmented system prompt
    const ragPrompt = buildRagPrompt(
      retrievedChunks,
      bot.systemPrompt,
      bot.persona,
    );

    // Step 5: Stream the AI response
    // chatStream returns the AI SDK streamText result. We pipe `result.textStream`
    // through a custom ReadableStream (instead of result.toTextStreamResponse()) so
    // we can inject lightweight STATUS SENTINELS the widget reads to show a
    // "Searching knowledge base…" / "Thinking…" typing indicator before the first
    // real token arrives.
    //
    // Sentinels use the § delimiter (vanishingly rare in natural chat text) and are
    // formatted `§STATUS:<state>§`. Two are emitted:
    //   §STATUS:researching§ — flushed immediately as the stream opens, so the
    //     widget shows the Researching pill the instant the request is accepted
    //     (this covers the RAG-retrieval + Groq-warmup latency before token 0).
    //   §STATUS:typing§        — flushed right before the first real text token,
    //     so the widget swaps the pill Researching → Typing as generation begins.
    // The widget CONSUMES sentinels before accumulating any text, so they never
    // leak into the rendered answer or the saved message.
    const result = await chatStream({
      provider: bot.modelProvider,
      modelId: bot.modelId,
      messages: body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: bot.temperature,
      systemPrompt: ragPrompt,
    });

    // Step 6: Create conversation + save messages (fire-and-forget)
    // We do this in the background so the stream starts immediately
    const conversationPromise = saveConversationAndMessages(
      bot.id,
      bot.workspaceId,
      body.messages,
      body.sessionId ?? null,
      // endUserToken column is NOT NULL — never pass null. Fall back to the same
      // per-visitor key the rate limiter already derived so a no-token request still
      // has a stable conversation grouping.
      body.endUserToken ?? endUserKey,
      retrievedChunks.map((c) => ({
        content: c.content,
        documentName: c.documentName,
        heading: c.heading,
        similarity: c.similarity,
      })),
    );

    // Don't await conversationPromise — let it run in background
    conversationPromise.catch((err) =>
      log.error("Failed to save conversation", { error: String(err) }),
    );

    // The AI SDK's `textStream` is a single-consumption async iterable that
    // silently yields zero chunks when iterated through a hand-rolled
    // ReadableStream (Next.js runtime buffering condition). The canonical path
    // is `result.toTextStreamResponse()` — which returns a Response whose body
    // is a working ReadableStream. We grab that body and wrap it in a new
    // ReadableStream that injects §STATUS sentinels without touching the SDK's
    // internal streaming pipeline.
    const encoder = new TextEncoder();
    let isFirstTextChunk = true;
    const sdkResponse = result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "X-RateLimit-Remaining": String(rl.remaining),
        "X-RateLimit-Reset": String(rl.reset),
      },
    });

    const sdkBodyReader = sdkResponse.body!.getReader();
    const stream = new ReadableStream<Uint8Array>({
      // start() runs during construction — before the consumer even begins
      // reading — so the researching sentinel is the very first byte the
      // client receives, guaranteeing the "Searching knowledge base…" pill
      // appears the instant the HTTP response opens (covers RAG + Groq
      // warmup latency before token 0).
      start(controller) {
        controller.enqueue(encoder.encode("§STATUS:researching§"));
      },
      async pull(controller) {
        try {
          const { done, value } = await sdkBodyReader.read();
          if (done) {
            controller.close();
            return;
          }
          // Swap the pill Researching → Typing right before the first real token.
          if (isFirstTextChunk) {
            isFirstTextChunk = false;
            controller.enqueue(encoder.encode("§STATUS:typing§"));
          }
          controller.enqueue(value);
        } catch (err) {
          log.error("Stream error during chat", { error: String(err) });
          controller.error(err);
        }
      },
      cancel() {
        sdkBodyReader.cancel();
      },
    });

    return new Response(stream, {
      headers: sdkResponse.headers,
    });
  } catch (err) {
    log.error("Chat API error", { error: String(err) });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Save the conversation and messages to the database.
 * This runs after the stream starts so the user doesn't wait for DB writes.
 */
async function saveConversationAndMessages(
  botId: string,
  workspaceId: string,
  messages: Array<{ role: string; content: string }>,
  sessionId: string | null,
  endUserToken: string,
  _citations?: Array<{
    content: string;
    documentName: string;
    heading: string | null;
    similarity: number;
  }>,
) {
  // Find or create conversation. Group by end-user (endUserToken) AND session so
  // two anonymous widget visitors on the same bot don't get folded into one OPEN
  // thread. sessionId alone isn't enough (it's often unset for widget traffic).
  let conversation = await prisma.conversation.findFirst({
    where: {
      botId,
      endUserToken,
      status: "OPEN",
      ...(sessionId ? { sessionId } : {}),
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        botId,
        workspaceId,
        sessionId: sessionId ?? null,
        endUserToken,
        status: "OPEN",
        messageCount: 0,
        tokenUsage: 0,
      },
    });
  }

  // Save all messages
  for (const msg of messages) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: msg.role.toUpperCase() as "USER" | "ASSISTANT",
        content: msg.content,
        totalTokens: 0, // Will be updated if we get token counts from the AI
      },
    });
  }

  // Update conversation stats
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      messageCount: { increment: messages.length },
    },
  });
}
