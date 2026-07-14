-- SupportIQ: enable required Postgres extensions
-- pgvector --- vector similarity search for RAG embeddings
-- citext   --- case-insensitive slugs/email without lower()-ing at every read
-- Idempotent; re-running is safe.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS citext;
