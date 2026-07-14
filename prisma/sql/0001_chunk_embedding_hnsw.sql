-- SupportIQ: HNSW cosine-similarity index over document chunks.
-- WHY HNSW over IVFFlat: no training step (great for a corpus that keeps growing as
-- businesses add docs). cosine via vector_cosine_ops matches our retrieval operator
-- (<=>). Filtering by botId is pushed by the planner before/after ANN at runtime,
-- assisted by the btree (botId) index defined in the schema. m=16/ef=64 are the
-- pgvector defaults — good quality/recall for sub-million-row corpora per bot.
CREATE INDEX IF NOT EXISTS "DocumentChunk_embedding_hnsw"
  ON "DocumentChunk"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
