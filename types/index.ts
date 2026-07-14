/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Shared domain types used across the app — DTO shapes for the API/Server-Action
 * surface, pagination, and result envelopes. Importing from `@prisma/client` gives us
 * the DB models; here we declare the *transport* shapes clients should see, which
 * intentionally omit internal fields (e.g. keyHash, embedding). Keeping a second
 * layer of types prevents leaking sensitive columns into JSON responses.
 */
import type {
  Bot,
  Conversation,
  Lead,
  Document,
  Message,
  BotStat,
} from "@prisma/client";

// ─── Roles ────────────────────────────────────────────────────────────────────
/** Workspace member roles (mirrors Clerk org roles). */
export type Role = "MEMBER" | "ADMIN" | "OWNER";

// ─── Result envelope ─────────────────────────────────────────────────────────
// Every Server Action returns this. It forces explicit success/error handling on the
// client (no try/catch around await, no thrown-then-swallowed exceptions). We use a
// discriminated union so TS narrows `data` automatically in the success branch.
export type ActionResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type AsyncActionResponse<T> = Promise<ActionResponse<T>>;

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number; // 1-indexed
  pageSize?: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

// ─── Public API DTOs (no sensitive fields leak) ───────────────────────────────
// We select with `Prisma.BotGetPayload` in the service layer; these are the
// slimmed shapes returned to clients. Keeping them named + exported means the API
// contract is documented in one place.

export type BotSummary = Pick<
  Bot,
  | "id"
  | "publicId"
  | "name"
  | "description"
  | "status"
  | "modelProvider"
  | "modelId"
  | "createdAt"
>;

export type BotDetail = Pick<
  Bot,
  | "id"
  | "publicId"
  | "name"
  | "description"
  | "status"
  | "modelProvider"
  | "modelId"
  | "temperature"
  | "systemPrompt"
  | "persona"
  | "language"
  | "memory"
  | "appearance"
  | "greeting"
  | "quickReplies"
  | "welcomeMessage"
  | "avatarUrl"
  | "logoUrl"
  | "leadCapture"
  | "leadFields"
  | "collectFeedback"
  | "suggestQuestions"
  | "showSources"
  | "rateLimitPerMinute"
  | "createdAt"
  | "updatedAt"
>;

export type DocumentSummary = Pick<
  Document,
  | "id"
  | "type"
  | "title"
  | "sourceUrl"
  | "status"
  | "progress"
  | "chunkCount"
  | "charCount"
  | "errorMessage"
  | "createdAt"
>;

export type LeadRow = Pick<
  Lead,
  "id" | "name" | "email" | "phone" | "company" | "createdAt"
>;

export type ConversationListItem = Pick<
  Conversation,
  | "id"
  | "botId"
  | "endUserToken"
  | "status"
  | "messageCount"
  | "tokenUsage"
  | "satisfaction"
  | "createdAt"
  | "updatedAt"
> & {
  lead?: Pick<Lead, "name" | "email"> | null;
  labels: string[];
  preview?: string; // first user message; populated at query time
};

export type MessageDTO = Pick<
  Message,
  "id" | "role" | "content" | "citations" | "feedback" | "createdAt"
>;

export type Citation = {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  sourceUrl?: string | null;
  page?: number | null;
  snippet?: string; // A short excerpt to aid trust.
};

export type ChatCitation = Pick<Citation, "documentTitle" | "sourceUrl" | "page">;

// ─── Analytics shapes ─────────────────────────────────────────────────────────
export type TimeSeriesPoint = { date: string; value: number };

export interface AnalyticsOverview {
  conversations: TimeSeriesPoint[];
  messages: TimeSeriesPoint[];
  totalConversations: number;
  totalMessages: number;
  avgResponseMs: number | null;
  satisfactionRate: number | null; // 0..1
  totalTokens: number;
  totalLeads: number;
}

export interface TopQuestionsResult {
  question: string;
  count: number;
  lastAskedAt: Date;
}

export type BotStatRow = Pick<
  BotStat,
  "date" | "conversations" | "messages" | "totalTokens" | "leadsCaptured" | "upVotes" | "downVotes"
>;

// ─── Clerk-provided session shape ─────────────────────────────────────────────
// Decoupled from the Clerk SDK so services can take a plain object (testable).
export interface SessionContext {
  userId: string; // Clerk user id
  orgId: string; // Clerk org id (== workspace root)
  orgRole: "org:owner" | "org:admin" | "org:member" | null;
  /** The resolved DB workspace id; populated by lib/auth. */
  workspaceId?: string;
}

// Re-export the enums clients commonly need, so they import from `types` only.
export type {
  Bot as BotModel,
  Conversation as ConversationModel,
  Document as DocumentModel,
} from "@prisma/client";
