/**
 * Create all SupportIQ tables via Neon serverless HTTP driver.
 * Used because Prisma's native engine can't connect from this machine (TCP/SSL issue).
 * After this script runs, `npx prisma generate` produces a working client.
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
const dbMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (!dbMatch) { console.error('DATABASE_URL not found'); process.exit(1); }
const sql = neon(dbMatch[1]);

async function run(label, sqlFn) {
  try {
    await sqlFn(sql);
    console.log(`✓ ${label}`);
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log(`⊘ ${label} (already exists)`);
    } else {
      console.error(`✗ ${label}: ${e.message}`);
    }
  }
}

async function main() {
  console.log('Creating SupportIQ schema on Neon...\n');

  // Extensions
  await run('CREATE EXTENSION vector', q => q`CREATE EXTENSION IF NOT EXISTS vector`);
  await run('CREATE EXTENSION citext', q => q`CREATE EXTENSION IF NOT EXISTS citext`);

  // Enums
  await run('CREATE TYPE Plan', q => q`DO $$ BEGIN
    CREATE TYPE "Plan" AS ENUM ('FREE','STARTER','GROWTH','SCALE','ENTERPRISE');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await run('CREATE TYPE Role', q => q`DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('OWNER','ADMIN','MEMBER');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await run('CREATE TYPE BotStatus', q => q`DO $$ BEGIN
    CREATE TYPE "BotStatus" AS ENUM ('ACTIVE','PAUSED','ARCHIVED');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await run('CREATE TYPE ModelProvider', q => q`DO $$ BEGIN
    CREATE TYPE "ModelProvider" AS ENUM ('OPENAI','ANTHROPIC','GROQ');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await run('CREATE TYPE MemoryMode', q => q`DO $$ BEGIN
    CREATE TYPE "MemoryMode" AS ENUM ('NONE','SESSION');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await run('CREATE TYPE DocumentType', q => q`DO $$ BEGIN
    CREATE TYPE "DocumentType" AS ENUM ('PDF','DOCX','TXT','CSV','TEXT','WEBSITE','FAQ');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await run('CREATE TYPE TrainingStatus', q => q`DO $$ BEGIN
    CREATE TYPE "TrainingStatus" AS ENUM ('PENDING','PROCESSING','READY','FAILED');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await run('CREATE TYPE ConversationStatus', q => q`DO $$ BEGIN
    CREATE TYPE "ConversationStatus" AS ENUM ('OPEN','RESOLVED','ARCHIVED');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await run('CREATE TYPE MessageRole', q => q`DO $$ BEGIN
    CREATE TYPE "MessageRole" AS ENUM ('USER','ASSISTANT','SYSTEM');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await run('CREATE TYPE Feedback', q => q`DO $$ BEGIN
    CREATE TYPE "Feedback" AS ENUM ('UP','DOWN');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);
  await run('CREATE TYPE LeadField', q => q`DO $$ BEGIN
    CREATE TYPE "LeadField" AS ENUM ('NAME','EMAIL','PHONE','COMPANY');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  // Workspace
  await run('CREATE TABLE Workspace', q => q`CREATE TABLE IF NOT EXISTS "Workspace" (
    "id" TEXT NOT NULL,
    "clerkOrgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "trialEndsAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
  )`);
  await run('Workspace clerkOrgId unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_clerkOrgId_key" ON "Workspace"("clerkOrgId")`);
  await run('Workspace slug unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_slug_key" ON "Workspace"("slug")`);
  await run('Workspace stripeCustomerId unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_stripeCustomerId_key" ON "Workspace"("stripeCustomerId") WHERE "stripeCustomerId" IS NOT NULL`);
  await run('Workspace slug idx', q => q`CREATE INDEX IF NOT EXISTS "Workspace_slug_idx" ON "Workspace"("slug")`);
  await run('Workspace plan idx', q => q`CREATE INDEX IF NOT EXISTS "Workspace_plan_idx" ON "Workspace"("plan")`);
  await run('Workspace stripeCustomerId idx', q => q`CREATE INDEX IF NOT EXISTS "Workspace_stripeCustomerId_idx" ON "Workspace"("stripeCustomerId")`);

  // User
  await run('CREATE TABLE User', q => q`CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMPTZ(3),
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "workspaceId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
  )`);
  await run('User clerkUserId unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkUserId_key" ON "User"("clerkUserId")`);
  await run('User email unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);
  await run('User workspaceId idx', q => q`CREATE INDEX IF NOT EXISTS "User_workspaceId_idx" ON "User"("workspaceId")`);
  await run('User email idx', q => q`CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email")`);

  // Bot
  await run('CREATE TABLE Bot', q => q`CREATE TABLE IF NOT EXISTS "Bot" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "publicId" TEXT NOT NULL,
    "status" "BotStatus" NOT NULL DEFAULT 'ACTIVE',
    "modelProvider" "ModelProvider" NOT NULL DEFAULT 'GROQ',
    "modelId" TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "systemPrompt" TEXT,
    "persona" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "memory" "MemoryMode" NOT NULL DEFAULT 'SESSION',
    "appearance" JSONB,
    "greeting" TEXT,
    "quickReplies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "welcomeMessage" TEXT,
    "avatarUrl" TEXT,
    "logoUrl" TEXT,
    "leadCapture" BOOLEAN NOT NULL DEFAULT true,
    "leadFields" "LeadField"[] DEFAULT ARRAY['NAME','EMAIL']::"LeadField"[],
    "collectFeedback" BOOLEAN NOT NULL DEFAULT true,
    "suggestQuestions" BOOLEAN NOT NULL DEFAULT true,
    "showSources" BOOLEAN NOT NULL DEFAULT true,
    "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
  )`);
  await run('Bot publicId unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "Bot_publicId_key" ON "Bot"("publicId")`);
  await run('Bot workspaceId idx', q => q`CREATE INDEX IF NOT EXISTS "Bot_workspaceId_idx" ON "Bot"("workspaceId")`);
  await run('Bot publicId idx', q => q`CREATE INDEX IF NOT EXISTS "Bot_publicId_idx" ON "Bot"("publicId")`);
  await run('Bot status idx', q => q`CREATE INDEX IF NOT EXISTS "Bot_status_idx" ON "Bot"("status")`);

  // Document
  await run('CREATE TABLE Document', q => q`CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "content" TEXT,
    "storageUrl" TEXT,
    "status" "TrainingStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "charCount" INTEGER NOT NULL DEFAULT 0,
    "crawledUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
  )`);
  await run('Document botId idx', q => q`CREATE INDEX IF NOT EXISTS "Document_botId_idx" ON "Document"("botId")`);
  await run('Document status idx', q => q`CREATE INDEX IF NOT EXISTS "Document_status_idx" ON "Document"("status")`);
  await run('Document type idx', q => q`CREATE INDEX IF NOT EXISTS "Document_type_idx" ON "Document"("type")`);

  // DocumentChunk (with pgvector embedding column)
  await run('CREATE TABLE DocumentChunk', q => q`CREATE TABLE IF NOT EXISTS "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "sourceUrl" TEXT,
    "page" INTEGER,
    "heading" TEXT,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "embedding" vector(1536),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
  )`);
  await run('DocumentChunk botId idx', q => q`CREATE INDEX IF NOT EXISTS "DocumentChunk_botId_idx" ON "DocumentChunk"("botId")`);
  await run('DocumentChunk documentId idx', q => q`CREATE INDEX IF NOT EXISTS "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId")`);
  await run('DocumentChunk botId+documentId idx', q => q`CREATE INDEX IF NOT EXISTS "DocumentChunk_botId_documentId_idx" ON "DocumentChunk"("botId","documentId")`);
  // HNSW index for vector search
  await run('DocumentChunk embedding HNSW', q => q`CREATE INDEX IF NOT EXISTS "DocumentChunk_embedding_hnsw" ON "DocumentChunk" USING hnsw ("embedding" vector_cosine_ops) WITH (m=16, ef_construction=64)`);

  // Faq
  await run('CREATE TABLE Faq', q => q`CREATE TABLE IF NOT EXISTS "Faq" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "embeddingId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
  )`);
  await run('Faq botId idx', q => q`CREATE INDEX IF NOT EXISTS "Faq_botId_idx" ON "Faq"("botId")`);

  // Lead
  await run('CREATE TABLE Lead', q => q`CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
  )`);
  await run('Lead workspaceId idx', q => q`CREATE INDEX IF NOT EXISTS "Lead_workspaceId_idx" ON "Lead"("workspaceId")`);
  await run('Lead botId idx', q => q`CREATE INDEX IF NOT EXISTS "Lead_botId_idx" ON "Lead"("botId")`);
  await run('Lead email idx', q => q`CREATE INDEX IF NOT EXISTS "Lead_email_idx" ON "Lead"("email")`);
  await run('Lead createdAt idx', q => q`CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt")`);

  // Conversation (with denormalized workspaceId)
  await run('CREATE TABLE Conversation', q => q`CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "endUserToken" TEXT NOT NULL,
    "sessionId" TEXT,
    "leadId" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "summary" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "tokenUsage" INTEGER NOT NULL DEFAULT 0,
    "avgResponseMs" INTEGER,
    "satisfaction" "Feedback",
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
  )`);
  await run('Conversation leadId unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_leadId_key" ON "Conversation"("leadId") WHERE "leadId" IS NOT NULL`);
  await run('Conversation botId idx', q => q`CREATE INDEX IF NOT EXISTS "Conversation_botId_idx" ON "Conversation"("botId")`);
  await run('Conversation workspaceId idx', q => q`CREATE INDEX IF NOT EXISTS "Conversation_workspaceId_idx" ON "Conversation"("workspaceId")`);
  await run('Conversation endUserToken idx', q => q`CREATE INDEX IF NOT EXISTS "Conversation_endUserToken_idx" ON "Conversation"("endUserToken")`);
  await run('Conversation status idx', q => q`CREATE INDEX IF NOT EXISTS "Conversation_status_idx" ON "Conversation"("status")`);
  await run('Conversation createdAt idx', q => q`CREATE INDEX IF NOT EXISTS "Conversation_createdAt_idx" ON "Conversation"("createdAt")`);
  await run('Conversation leadId idx', q => q`CREATE INDEX IF NOT EXISTS "Conversation_leadId_idx" ON "Conversation"("leadId")`);
  await run('Conversation botId+createdAt idx', q => q`CREATE INDEX IF NOT EXISTS "Conversation_botId_createdAt_idx" ON "Conversation"("botId","createdAt")`);
  await run('Conversation workspaceId+createdAt idx', q => q`CREATE INDEX IF NOT EXISTS "Conversation_workspaceId_createdAt_idx" ON "Conversation"("workspaceId","createdAt")`);

  // Message
  await run('CREATE TABLE Message', q => q`CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "generationMs" INTEGER,
    "citations" JSONB,
    "feedbackNote" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
  )`);
  await run('Message conversationId idx', q => q`CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId")`);
  await run('Message role idx', q => q`CREATE INDEX IF NOT EXISTS "Message_role_idx" ON "Message"("role")`);
  await run('Message createdAt idx', q => q`CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt")`);

  // ConversationLabel
  await run('CREATE TABLE ConversationLabel', q => q`CREATE TABLE IF NOT EXISTS "ConversationLabel" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "assignedById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationLabel_pkey" PRIMARY KEY ("id")
  )`);
  await run('ConversationLabel conversationId+label unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "ConversationLabel_conversationId_label_key" ON "ConversationLabel"("conversationId","label")`);
  await run('ConversationLabel conversationId idx', q => q`CREATE INDEX IF NOT EXISTS "ConversationLabel_conversationId_idx" ON "ConversationLabel"("conversationId")`);
  await run('ConversationLabel label idx', q => q`CREATE INDEX IF NOT EXISTS "ConversationLabel_label_idx" ON "ConversationLabel"("label")`);

  // EmbedToken
  await run('CREATE TABLE EmbedToken', q => q`CREATE TABLE IF NOT EXISTS "EmbedToken" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "allowedOrigins" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmbedToken_pkey" PRIMARY KEY ("id")
  )`);
  await run('EmbedToken token unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "EmbedToken_token_key" ON "EmbedToken"("token")`);
  await run('EmbedToken botId idx', q => q`CREATE INDEX IF NOT EXISTS "EmbedToken_botId_idx" ON "EmbedToken"("botId")`);
  await run('EmbedToken token idx', q => q`CREATE INDEX IF NOT EXISTS "EmbedToken_token_idx" ON "EmbedToken"("token")`);

  // BotStat
  await run('CREATE TABLE BotStat', q => q`CREATE TABLE IF NOT EXISTS "BotStat" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "conversations" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "leadsCaptured" INTEGER NOT NULL DEFAULT 0,
    "upVotes" INTEGER NOT NULL DEFAULT 0,
    "downVotes" INTEGER NOT NULL DEFAULT 0,
    "avgResponseMs" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "BotStat_pkey" PRIMARY KEY ("id")
  )`);
  await run('BotStat botId+date unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "BotStat_botId_date_key" ON "BotStat"("botId","date")`);
  await run('BotStat botId+date idx', q => q`CREATE INDEX IF NOT EXISTS "BotStat_botId_date_idx" ON "BotStat"("botId","date")`);

  // TopQuestion
  await run('CREATE TABLE TopQuestion', q => q`CREATE TABLE IF NOT EXISTS "TopQuestion" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "question" TEXT NOT NULL,
    "normalizedQuestion" TEXT NOT NULL,
    "lastAskedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "TopQuestion_pkey" PRIMARY KEY ("id")
  )`);
  await run('TopQuestion botId+normalizedQuestion unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "TopQuestion_botId_normalizedQuestion_key" ON "TopQuestion"("botId","normalizedQuestion")`);
  await run('TopQuestion botId+count idx', q => q`CREATE INDEX IF NOT EXISTS "TopQuestion_botId_count_idx" ON "TopQuestion"("botId","count" DESC)`);

  // UsageRecord
  await run('CREATE TABLE UsageRecord', q => q`CREATE TABLE IF NOT EXISTS "UsageRecord" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "botId" TEXT,
    "date" DATE NOT NULL,
    "messagesCount" INTEGER NOT NULL DEFAULT 0,
    "tokensCount" INTEGER NOT NULL DEFAULT 0,
    "storageBytes" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
  )`);
  await run('UsageRecord workspaceId+date unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "UsageRecord_workspaceId_date_key" ON "UsageRecord"("workspaceId","date")`);
  await run('UsageRecord workspaceId+date idx', q => q`CREATE INDEX IF NOT EXISTS "UsageRecord_workspaceId_date_idx" ON "UsageRecord"("workspaceId","date")`);

  // ApiKey
  await run('CREATE TABLE ApiKey', q => q`CREATE TABLE IF NOT EXISTS "ApiKey" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
  )`);
  await run('ApiKey keyHash unique', q => q`CREATE UNIQUE INDEX IF NOT EXISTS "ApiKey_keyHash_key" ON "ApiKey"("keyHash")`);
  await run('ApiKey workspaceId idx', q => q`CREATE INDEX IF NOT EXISTS "ApiKey_workspaceId_idx" ON "ApiKey"("workspaceId")`);
  await run('ApiKey keyHash idx', q => q`CREATE INDEX IF NOT EXISTS "ApiKey_keyHash_idx" ON "ApiKey"("keyHash")`);

  // WebhookConfig
  await run('CREATE TABLE WebhookConfig', q => q`CREATE TABLE IF NOT EXISTS "WebhookConfig" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secret" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "WebhookConfig_pkey" PRIMARY KEY ("id")
  )`);
  await run('WebhookConfig workspaceId idx', q => q`CREATE INDEX IF NOT EXISTS "WebhookConfig_workspaceId_idx" ON "WebhookConfig"("workspaceId")`);

  // Add FK constraints (separate because they need tables to exist first)
  console.log('\nAdding foreign key constraints...');

  await run('FK User→Workspace', q => q`DO $$ BEGIN
    ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK Bot→Workspace', q => q`DO $$ BEGIN
    ALTER TABLE "Bot" ADD CONSTRAINT "Bot_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK Document→Bot', q => q`DO $$ BEGIN
    ALTER TABLE "Document" ADD CONSTRAINT "Document_botId_fkey"
    FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK DocumentChunk→Document', q => q`DO $$ BEGIN
    ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK Faq→Bot', q => q`DO $$ BEGIN
    ALTER TABLE "Faq" ADD CONSTRAINT "Faq_botId_fkey"
    FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK Lead→Bot', q => q`DO $$ BEGIN
    ALTER TABLE "Lead" ADD CONSTRAINT "Lead_botId_fkey"
    FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK Lead→Workspace', q => q`DO $$ BEGIN
    ALTER TABLE "Lead" ADD CONSTRAINT "Lead_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK Conversation→Bot', q => q`DO $$ BEGIN
    ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_botId_fkey"
    FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK Conversation→Workspace', q => q`DO $$ BEGIN
    ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK Conversation→Lead', q => q`DO $$ BEGIN
    ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK Message→Conversation', q => q`DO $$ BEGIN
    ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK ConversationLabel→Conversation', q => q`DO $$ BEGIN
    ALTER TABLE "ConversationLabel" ADD CONSTRAINT "ConversationLabel_conversationId_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK ConversationLabel→User', q => q`DO $$ BEGIN
    ALTER TABLE "ConversationLabel" ADD CONSTRAINT "ConversationLabel_assignedById_fkey"
    FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK EmbedToken→Bot', q => q`DO $$ BEGIN
    ALTER TABLE "EmbedToken" ADD CONSTRAINT "EmbedToken_botId_fkey"
    FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK BotStat→Bot', q => q`DO $$ BEGIN
    ALTER TABLE "BotStat" ADD CONSTRAINT "BotStat_botId_fkey"
    FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK UsageRecord→Workspace', q => q`DO $$ BEGIN
    ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK ApiKey→Workspace', q => q`DO $$ BEGIN
    ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await run('FK WebhookConfig→Workspace', q => q`DO $$ BEGIN
    ALTER TABLE "WebhookConfig" ADD CONSTRAINT "WebhookConfig_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  // Feedback needs special handling - it references Message
  await run('FK Message→Feedback (feedback column)', q => q`DO $$ BEGIN
    ALTER TABLE "Message" ADD CONSTRAINT "Message_feedback_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  console.log('\n✅ Schema created successfully on Neon!');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
