/**
 * WHY THIS FILE EXISTS
 * -------------------
 * AI chat provider abstraction. Provides a single `chat()` function that
 * dispatches to the correct provider (OpenAI, Anthropic, Groq) based on the
 * bot's `modelProvider` and `modelId` settings.
 *
 * This is the ONLY place in the codebase that imports AI SDK providers. If
 * you need to swap a provider, add a new one, or change model defaults, this
 * is the file to modify. The rest of the codebase works with `chat()` only.
 *
 * Streaming: All providers return an `AsyncIterable<string>` for streaming
 * responses. The chat API route pipes this directly to the Response body
 * using the Vercel AI SDK's `toDataStreamResponse()` or manual SSE.
 */
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { ModelProvider } from "@prisma/client";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  provider: ModelProvider;
  modelId: string;
  messages: ChatMessage[];
  temperature?: number;
  systemPrompt?: string;
}

/**
 * Map of provider → model ID to the actual AI SDK model instance.
 * This is the single source of truth for which models are available.
 */
function getModel(provider: ModelProvider, modelId: string) {
  switch (provider) {
    case "OPENAI":
      return openai(modelId);

    case "ANTHROPIC":
      return anthropic(modelId);

    case "GROQ": {
      // Groq uses an OpenAI-compatible API. `compatibility: "compatible"` is
      // REQUIRED: in @ai-sdk/openai v1 the default ("strict") mode sends the
      // request in a shape Groq accepts but then stream-parses in a way that
      // drops every text delta — `streamText` yields ZERO text chunks and the
      // chat responds with a 200 + empty body (the "bots no longer responding"
      // bug). "compatible" mode issues the plain chat-completions request
      // Groq streams correctly. See https://ai-sdk.dev/providers/openai
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY,
        compatibility: "compatible",
      });
      return groq(modelId);
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Stream a chat response. Returns the full AI SDK `streamText` result so the
 * caller can turn it into an HTTP response via `.toTextStreamResponse()`
 * (preferred) or consume `.textStream` directly.
 *
 * Why return the result object (not just `.textStream`): AI SDK v4's
 * `textStream` is a single-consumption async iterable. Consuming it through a
 * hand-rolled ReadableStream can silently yield zero chunks under certain
 * Next.js runtime buffering conditions — `toTextStreamResponse()` is the SDK's
 * canonical, battle-tested path and flushes correctly. Keeping the result
 * here lets the route use that helper while `chatComplete` still reads `.textStream`.
 */
export async function chatStream(options: ChatOptions) {
  const { provider, modelId, messages, temperature = 0.7, systemPrompt } = options;

  const allMessages = [
    ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
    ...messages,
  ];

  const result = streamText({
    model: getModel(provider, modelId),
    messages: allMessages,
    temperature,
    // Explicitly set a high maxTokens so providers (especially Groq) don't
    // truncate the response at their low default (often 256–1024 tokens).
    // 8192 is the max output for llama-3.3-70b-versatile on Groq and is safe
    // across OpenAI and Anthropic as well.
    maxTokens: 8192,
  });

  return result;
}

/**
 * Non-streaming chat for simple use cases (e.g., title generation).
 * Returns the full response as a string.
 */
export async function chatComplete(options: ChatOptions): Promise<string> {
  const { provider, modelId, messages, temperature = 0.7, systemPrompt } = options;

  const allMessages = [
    ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
    ...messages,
  ];

  const result = streamText({
    model: getModel(provider, modelId),
    messages: allMessages,
    temperature,
  });

  // Collect the full text
  let text = "";
  for await (const chunk of result.textStream) {
    text += chunk;
  }
  return text;
}
