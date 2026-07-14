/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Knowledge base document service. Manages the full document lifecycle:
 *  1. Upload (create Document record, store file)
 *  2. Process (extract text, chunk, embed, store vectors)
 *  3. Query (similarity search via pgvector — see services/ai/retrieval.ts)
 *  4. Delete (cascade remove chunks + embeddings)
 *
 * The processing pipeline is synchronous for simplicity. In production you'd
 * move this to a background job queue (Inngest, QStash, etc.) — but the
 * architecture is designed so the service functions are the same regardless
 * of whether they're called from a server action or a background worker.
 *
 * VECTOR STORAGE: pgvector columns are `Unsupported("vector(1536)")` in Prisma —
 * Prisma's typed create/update cannot write them. We use `$executeRaw` with a
 * `::vector` cast to store the embedding as a proper pgvector literal. This is
 * the only correct way to write to a vector column via Prisma + Neon HTTP.
 */
import { prisma } from "@/lib/prisma";
import { scopedPrisma, belongsToWorkspace } from "@/lib/auth/scoped";
import { embedMany, embeddingsConfigured } from "@/services/ai/embeddings";
import { extractPdfText, fetchUrlText, extractPlainText } from "@/lib/extract-text";
import type { Document, Prisma } from "@prisma/client";

/** Document type → accepted MIME types map */
export const DOCUMENT_ACCEPT_MAP: Record<string, string[]> = {
  PDF: ["application/pdf"],
  TXT: ["text/plain"],
  CSV: ["text/csv"],
  WEBSITE: [],
  FAQ: [],
};

/**
 * Create a document record and kick off processing.
 * For file-based docs (PDF, TXT, CSV), pass `fileBuffer`.
 * For websites, pass `url`. For FAQs, pass `content` directly.
 */
export async function createDocument(
  workspaceId: string,
  botPublicId: string,
  input: {
    type: "PDF" | "TXT" | "CSV" | "WEBSITE" | "FAQ";
    name: string;
    url?: string;
    content?: string;
    fileBuffer?: Buffer;
  },
): Promise<Document> {
  const scoped = scopedPrisma({ workspaceId });

  // Verify bot exists and belongs to workspace
  const bot = await scoped.bot.findUnique({ where: { publicId: botPublicId } });
  if (!bot) throw new Error("Bot not found");
  belongsToWorkspace(bot, workspaceId);

  // Create document record
  const doc = await scoped.document.create({
    data: {
      botId: bot.id,
      type: input.type,
      title: input.name,
      sourceUrl: input.url ?? null,
      status: "PENDING",
      progress: 0,
    },
  });

  // Process synchronously (would be a background job in production)
  let processingError: string | null = null;
  try {
    await processDocument(workspaceId, doc.id, input);
  } catch (err) {
    processingError =
      err instanceof Error ? err.message : String(err);
    console.error(`Document processing failed for ${doc.id}:`, err);
    await scoped.document.update({
      where: { id: doc.id },
      data: {
        status: "FAILED",
        progress: 0,
        errorMessage: processingError,
      },
    });
  }

  // Re-fetch to return the CURRENT status (not the stale PENDING from creation).
  // processDocument may have set READY or the catch above may have set FAILED.
  return prisma.document.findUniqueOrThrow({ where: { id: doc.id } });
}

/**
 * Process a document: extract text → chunk → embed → store in pgvector.
 */
async function processDocument(
  workspaceId: string,
  documentId: string,
  input: {
    type: string;
    content?: string;
    url?: string;
    fileBuffer?: Buffer;
  },
) {
  const scoped = scopedPrisma({ workspaceId });

  // Mark as processing
  console.log(`[doc:${documentId}] Starting processing — type=${input.type}`);
  await scoped.document.update({
    where: { id: documentId },
    data: { status: "PROCESSING", progress: 5 },
  });

  // ─── Step 1: Extract text content ─────────────────────────────
  let fullText = "";
  let extractedTitle: string | undefined;

  if (input.content) {
    // FAQ content — passed directly
    fullText = input.content;
  } else if (input.url) {
    // URL — fetch and clean with cheerio
    await scoped.document.update({
      where: { id: documentId },
      data: { progress: 10 },
    });
    const fetched = await fetchUrlText(input.url);
    fullText = fetched.text;
    extractedTitle = fetched.title;
  } else if (input.fileBuffer) {
    // File — type-specific extraction
    if (input.type === "PDF") {
      fullText = await extractPdfText(input.fileBuffer);
    } else {
      // TXT, CSV, Markdown — plain text decode
      fullText = await extractPlainText(input.fileBuffer);
    }
  }

  if (!fullText.trim()) {
    throw new Error("No readable text content extracted from the source.");
  }

  // Update title if URL extraction provided a better one
  if (extractedTitle) {
    await scoped.document.update({
      where: { id: documentId },
      data: { title: extractedTitle },
    });
  }

  await scoped.document.update({
    where: { id: documentId },
    data: { progress: 25 },
  });

  // ─── Step 2: Chunk the text ───────────────────────────────────
  const chunks = chunkText(fullText, { maxTokens: 500, overlap: 50 });

  await scoped.document.update({
    where: { id: documentId },
    data: { progress: 35, chunkCount: chunks.length },
  });

  // ─── Step 3: Embed all chunks in batches + store via raw SQL ──
  const docRow = await scoped.document.findUnique({
    where: { id: documentId },
    select: { botId: true },
  });
  if (!docRow) throw new Error("Document disappeared during processing");

  // Embed in batches (embedMany handles internal chunking)
  console.log(`[doc:${documentId}] Embedding ${chunks.length} chunks...`);
  const embeddings = await embedMany(chunks.map((c) => c.content));
  console.log(`[doc:${documentId}] Got ${embeddings.length} embeddings`);

  // Store each chunk with its vector via $executeRaw.
  // Prisma cannot write Unsupported("vector(1536)") columns through typed
  // create — it treats the value as JSON and pgvector rejects it.
  // Raw SQL with ::vector cast is the canonical approach for pgvector + Prisma.
  const vectorDim = 1536;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    const vec = embeddings[i]!;
    const vectorLiteral = `[${vec.join(",")}]`;

    await prisma.$executeRaw`
      INSERT INTO "DocumentChunk"
        ("id", "documentId", "botId", "content", "chunkIndex", "heading", "page", "tokenCount", "embedding", "createdAt")
      VALUES
        (gen_random_uuid(), ${documentId}, ${docRow.botId}, ${chunk.content}, ${chunk.index}, ${chunk.heading ?? null}, ${chunk.page ?? null}, ${chunk.tokenCount}, ${vectorLiteral}::vector, NOW())
    `;

    // Update progress
    const progress = 35 + Math.round(((i + 1) / chunks.length) * 55);
    await scoped.document.update({
      where: { id: documentId },
      data: { progress },
    });
  }

  // Mark as complete
  console.log(`[doc:${documentId}] Processing complete — ${chunks.length} chunks stored`);
  await scoped.document.update({
    where: { id: documentId },
    data: { status: "READY", progress: 100 },
  });
}

/**
 * Simple text chunker. Splits on paragraph boundaries, respects a max token
 * count per chunk, and overlaps by `overlap` tokens for context continuity.
 */
function chunkText(
  text: string,
  options: { maxTokens: number; overlap: number },
): Array<{
  content: string;
  index: number;
  heading: string | null;
  page: number | null;
  tokenCount: number;
}> {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: Array<{
    content: string;
    index: number;
    heading: string | null;
    page: number | null;
    tokenCount: number;
  }> = [];

  let currentIndex = 0;
  let buffer = "";

  for (const para of paragraphs) {
    const testBuffer = buffer ? `${buffer}\n\n${para}` : para;
    // Rough token estimate: ~4 chars per token
    const estimatedTokens = Math.ceil(testBuffer.length / 4);

    if (estimatedTokens > options.maxTokens && buffer) {
      chunks.push({
        content: buffer.trim(),
        index: currentIndex++,
        heading: extractHeading(buffer),
        page: null,
        tokenCount: Math.ceil(buffer.length / 4),
      });
      // Overlap: keep last ~overlap tokens worth of text
      const overlapChars = options.overlap * 4;
      buffer =
        buffer.length > overlapChars
          ? buffer.slice(-overlapChars) + "\n\n" + para
          : para;
    } else {
      buffer = testBuffer;
    }
  }

  // Flush remaining buffer
  if (buffer.trim()) {
    chunks.push({
      content: buffer.trim(),
      index: currentIndex,
      heading: extractHeading(buffer),
      page: null,
      tokenCount: Math.ceil(buffer.length / 4),
    });
  }

  return chunks;
}

/** Extract the first markdown heading or sentence as a chunk label. */
function extractHeading(text: string): string | null {
  const match = text.match(/^#{1,3}\s+(.+)/m);
  if (match) return match[1]!.trim();
  // Fallback: first sentence
  const sentenceMatch = text.match(/^(.{10,80}?)[.!?]\s/m);
  if (sentenceMatch) return sentenceMatch[1]!.trim() + "…";
  return null;
}

/** List all documents for a bot. */
export async function listDocuments(workspaceId: string, botPublicId: string) {
  const scoped = scopedPrisma({ workspaceId });

  const bot = await scoped.bot.findUnique({ where: { publicId: botPublicId } });
  if (!bot) throw new Error("Bot not found");

  return scoped.document.findMany({
    where: { botId: bot.id },
    orderBy: { createdAt: "desc" },
  });
}

/** Delete a document and all its chunks. Chunks have FK cascade, but be explicit. */
export async function deleteDocument(
  workspaceId: string,
  documentId: string,
): Promise<void> {
  const scoped = scopedPrisma({ workspaceId });

  // Delete chunks first (FK cascade handles it too, but explicit is safer)
  await scoped.documentChunk.deleteMany({ where: { documentId } });
  await scoped.document.delete({ where: { id: documentId } });
}

/** Get a document by ID, verified to belong to the workspace. */
export async function getDocument(
  workspaceId: string,
  documentId: string,
): Promise<Document> {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { bot: { select: { workspaceId: true } } },
  });
  if (!doc) throw new Error("Document not found");
  if (doc.bot.workspaceId !== workspaceId) throw new Error("Not authorized");
  return doc;
}
