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
      // Groq uses an OpenAI-compatible API
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY,
      });
      return groq(modelId);
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Stream a chat response. Returns an AsyncIterable that yields text chunks.
 *
 * Usage in a Route Handler:
 * ```ts
 * const stream = await chatStream({ provider, modelId, messages });
 * return new Response(stream, { headers: { "Content-Type": "text/plain" } });
 * ```
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

  return result.textStream;
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
