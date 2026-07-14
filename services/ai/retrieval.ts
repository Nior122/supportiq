/**
 * WHY THIS FILE EXISTS
 * -------------------
 * RAG (Retrieval-Augmented Generation) retrieval service. Given a user question,
 * this service:
 *  1. Embeds the question using the same model as the knowledge base
 *  2. Performs a pgvector cosine similarity search against stored document chunks
 *  3. Returns the top-K most relevant chunks with their source metadata
 *
 * The search is scoped to a specific bot via the `botId` column on
 * `DocumentChunk` — this denormalized FK avoids a JOIN through the Document
 * table and makes the HNSW index more efficient.
 *
 * The HNSW index parameters (m=16, ef_construction=64) are set in the SQL
 * migration file. At query time, we set `ef_search=32` for a good recall/
 * latency tradeoff. This value can be tuned based on the size of the chunk
 * corpus.
 */
import { prisma } from "@/lib/prisma";
import { embed } from "./embeddings";

export interface RetrievedChunk {
  content: string;
  chunkIndex: number;
  heading: string | null;
  documentName: string;
  similarity: number;
}

/**
 * Retrieve the most relevant document chunks for a query.
 *
 * @param botId - The bot's internal ID (not publicId)
 * @param query - The user's question text
 * @param topK - Number of chunks to retrieve (default 5)
 * @returns Ranked list of relevant chunks with similarity scores
 */
export async function retrieveRelevantChunks(
  botId: string,
  query: string,
  topK: number = 5,
): Promise<RetrievedChunk[]> {
  // Step 1: Embed the query
  const queryVector = await embed(query);

  // Step 2: pgvector similarity search via raw SQL
  // We use cosine distance (1 - cosine similarity) and ORDER ASC
  // The HNSW index accelerates this query for large corpora.
  const vectorString = `[${queryVector.join(",")}]`;

  console.log(`[retrieval] Searching botId=${botId}, queryLen=${query.length}, topK=${topK}`);

  const results: Array<{
    content: string;
    chunkIndex: number;
    heading: string | null;
    documentName: string;
    similarity: number;
  }> = await prisma.$queryRaw`
    SELECT
      dc.content,
      dc."chunkIndex",
      dc.heading,
      d.title as "documentName",
      (1 - (dc.embedding <=> ${vectorString}::vector)) as similarity
    FROM "DocumentChunk" dc
    JOIN "Document" d ON d.id = dc."documentId"
    WHERE dc."botId" = ${botId}
      AND dc.embedding IS NOT NULL
    ORDER BY dc.embedding <=> ${vectorString}::vector
    LIMIT ${topK}
  `;

  console.log(`[retrieval] Found ${results.length} chunks`);

  return results;
}

/**
 * Build the RAG system prompt by injecting retrieved context.
 * This creates a structured prompt that instructs the AI to use the provided
 * context for answering, while being honest about knowledge limitations.
 */
export function buildRagPrompt(
  retrievedChunks: RetrievedChunk[],
  botSystemPrompt: string | null,
  botPersona: string | null,
): string {
  const contextBlock = retrievedChunks.length > 0
    ? retrievedChunks
        .map(
          (chunk, i) =>
            `[Source ${i + 1}: ${chunk.documentName}${chunk.heading ? ` — ${chunk.heading}` : ""}]\n${chunk.content}`,
        )
        .join("\n\n---\n\n")
    : "No relevant documents found.";

  return `You are a helpful customer support assistant${botPersona ? ` who is ${botPersona}` : ""}.

${botSystemPrompt ? `${botSystemPrompt}\n\n` : ""}## Knowledge Base Context

Use the following context to answer the user's question. If the context doesn't contain the answer, say so honestly — don't make up information.

${contextBlock}

## Rules

- Base your answers on the provided context when possible
- If you cite a source, mention which document it came from
- Be helpful and thorough — provide complete, well-structured answers that fully address the user's question
- Use formatting (bullet points, numbered lists, bold) to make longer answers easy to read
- If you don't know the answer, say "I don't have information about that in my knowledge base"
- Never fabricate information not present in the context`;
}
