/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Embedding service — turns text into a numeric vector for pgvector RAG.
 *
 * Provider strategy: Jina first, OpenAI fallback. Both expose an OpenAI-compatible
 * embeddings endpoint, so we use the same `embeddings.create` call shape for both —
 * only the base URL + model differ. Jina's `jina-embeddings-v3` emits 1024 dims via
 * the OpenAI-compatible endpoint (the max it allows). Column is vector(1024).
 *
 * CRITICAL: the returned `number[]` is stored in a pgvector column via raw SQL
 * ($executeRaw, `::vector` cast) — NOT through Prisma's typed create() data, which
 * cannot write `Unsupported("vector(N)")` columns. See services/documents.ts.
 * Length must match the column dimension (1024).
 *
 * Memory anchor: [[supportiq-ai-providers]] — Groq is chat-only (no embedding model),
 * so embeddings must use a different provider than the chat provider.
 */
import OpenAI from "openai";
import { env, availableEmbeddingProvider } from "@/lib/env";

const JINA_BASE_URL = "https://api.jina.ai/v1";

let client: OpenAI | null = null;
let clientModel: string | null = null;
let clientDimensions: number | null = null;

/**
 * Lazily build the OpenAI-compatible client for whichever embedding provider is
 * configured. Throws a clear, actionable error if none is configured — this is the
 * single place that error originates, so upload + retrieval callers all surface the
 * same message instead of a cryptic provider stack trace.
 */
function getClient(): { client: OpenAI; model: string; dimensions: number } {
  if (client && clientModel && clientDimensions) {
    return { client, model: clientModel, dimensions: clientDimensions };
  }

  const provider = availableEmbeddingProvider;
  if (!provider) {
    throw new Error(
      "Embeddings are not configured. Set JINAAI_API_KEY (free tier, recommended) or OPENAI_API_KEY in your environment. Until then, document uploads and knowledge-base retrieval are disabled.",
    );
  }

  if (provider === "jina") {
    if (!env.JINAAI_API_KEY) {
      throw new Error("JINAAI_API_KEY is required for Jina embeddings.");
    }
    client = new OpenAI({
      apiKey: env.JINAAI_API_KEY,
      baseURL: JINA_BASE_URL,
    });
    clientModel = env.JINA_EMBEDDING_MODEL;
    clientDimensions = env.JINA_EMBEDDING_DIMENSIONS;
  } else {
    // OpenAI fallback — matches the original schema assumption.
    if (!env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required for OpenAI embeddings.");
    }
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    clientModel = env.OPENAI_EMBEDDING_MODEL;
    // OpenAI text-embedding-3-small supports a `dimensions` param (min 256, max 1536).
    // Use 1024 to match the vector(1024) column (and Jina's cap).
    clientDimensions = 1024;
  }

  return { client, model: clientModel!, dimensions: clientDimensions! };
}

/**
 * Generate an embedding vector for a single text string.
 * Returns a float array whose length equals the configured dimension (1024 for Jina v3).
 */
export async function embed(text: string): Promise<number[]> {
  const { client: c, model, dimensions } = getClient();

  const response = await c.embeddings.create({
    model,
    input: text,
    dimensions,
  });

  const embedding = response.data[0]?.embedding;
  if (!embedding) throw new Error("No embedding returned from the embedding provider.");
  return embedding;
}

/**
 * Generate embeddings for multiple texts in a single API call.
 * More efficient than calling `embed()` in a loop — and document ingestion almost
 * always batches N chunks, so this is the hot path for uploads.
 *
 * Jina caps batch input length; we chunk the request internally to stay below it
 * so callers can pass arbitrary-length arrays.
 */
const BATCH_SIZE = 64;

export async function embedMany(texts: string[]): Promise<number[][]> {
  const { client: c, model, dimensions } = getClient();

  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await c.embeddings.create({
      model,
      input: batch,
      dimensions,
    });
    // Providers return embeddings in input order.
    for (const item of response.data) {
      out.push(item.embedding);
    }
  }
  return out;
}

/** True when an embedding provider key is configured (for upload-time gating + UI). */
export function embeddingsConfigured(): boolean {
  return availableEmbeddingProvider !== null;
}
