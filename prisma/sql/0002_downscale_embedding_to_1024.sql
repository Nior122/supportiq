-- SupportIQ: Downscale embedding vector from 1536 to 1024 dimensions.
-- WHY: Jina's jina-embeddings-v3 OpenAI-compatible endpoint caps at 1024 dims.
-- The 422 error ("dimensions should be <= 1024") was blocking all document processing.
-- 1024 dims gives excellent cosine-similarity quality for RAG at lower storage cost.
--
-- SAFETY: All uploads have been failing, so there is no existing embedding data to lose.

-- 1. Drop the HNSW index (references the old vector dimension)
DROP INDEX IF EXISTS "DocumentChunk_embedding_hnsw";

-- 2. Alter the column dimension
ALTER TABLE "DocumentChunk"
  ALTER COLUMN "embedding" TYPE vector(1024);

-- 3. Re-create the HNSW index on the new dimension
CREATE INDEX "DocumentChunk_embedding_hnsw"
  ON "DocumentChunk"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
