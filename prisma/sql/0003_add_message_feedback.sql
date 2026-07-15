-- SupportIQ: Add the missing `feedback` column to the "Message" table.
-- WHY: prisma/schema.prisma declares `feedback Feedback?` on Message (thumbs up/down
-- reaction per assistant message) and the codebase writes it via prisma.message.create().
-- The live Neon DB was missing this column (schema drift): every message insert threw
--   PrismaClientKnownRequestError: Invalid `prisma.message.create()` invocation:
--   column Message.feedback does not exist
-- which surfaced at the chat route as a backgrounded save failure AND, under repeated
-- requests, exhausted the Neon HTTP connection pool producing 500
-- "NeonDbError: Error connecting to database: fetch failed" — the "bots no longer
-- responding" symptom.
--
-- SAFETY: nullable addition, no existing data affected. The "Feedback" enum already
-- exists in the public schema (used by Conversation.satisfaction), so we only add
-- the column referencing it.

ALTER TABLE "Message"
  ADD COLUMN IF NOT EXISTS "feedback" "Feedback";
