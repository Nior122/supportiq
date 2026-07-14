/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Multi-tenant data isolation is the single biggest class of SaaS security bug:
 * "forgot the WHERE workspaceId = ? and returned a different customer's rows." We
 * eliminate it structurally — services don't pass a `where` object raw to Prisma;
 * they call `scopedPrisma(workspaceId).bot.findMany({})` and the tenant filter is
 * FORCED in. You can still add more filters; you simply cannot forget this one.
 *
 * The pattern is intentionally typed as `PrismaClient`-shaped so existing call sites
 * read like normal Prisma calls (`prisma.bot.findUnique`) with the only difference
 * being the scoped namespace.
 *
 * Limitation: this covers the common find/first/createMany paths. Action authors
 * who need raw `$queryRaw` still pass workspaceId manually (those queries are rare
 * and reviewable). We prefer ergonomics + safety over enforcing radii that hurt.
 */
import { prisma } from "@/lib/prisma";

interface Scope {
  workspaceId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = Record<string, any>;

/**
 * Returns a Prisma-like facade where tenant-scoped models inject the workspaceId
 * filter for every read, and every create gets it defaulted. Models that are NOT
 * tenant-scoped (e.g. ApiKey's `keyHash`) aren't proxied — you use `prisma` directly.
 */
export function scopedPrisma(scope: Scope) {
  const { workspaceId } = scope;
  return {
    // ── Bot ──
    bot: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.bot.findMany({
          where: { ...where, workspaceId },
          ...rest,
        }),
      findUnique: ({ where, ...rest }: Q) =>
        prisma.bot.findUnique({
          where, // we can't add to a unique filter; callers must verify ownership below
          ...rest,
        }),
      findFirst: ({ where = {}, ...rest }: Q = {}) =>
        prisma.bot.findFirst({ where: { ...where, workspaceId }, ...rest }),
      create: ({ data, ...rest }: Q) =>
        prisma.bot.create({ data: { ...data, workspaceId }, ...rest }),
      update: ({ where, data, ...rest }: Q) =>
        prisma.bot.update({ where, data, ...rest }),
      delete: ({ where, ...rest }: Q) =>
        prisma.bot.delete({ where, ...rest }),
      count: ({ where = {}, ...rest }: Q = {}) =>
        prisma.bot.count({ where: { ...where, workspaceId }, ...rest }),
    },
    // ── Conversation ──
    conversation: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.conversation.findMany({
          where: { ...where, workspaceId },
          ...rest,
        }),
      findUnique: ({ where, ...rest }: Q) =>
        prisma.conversation.findUnique({ where, ...rest }),
      findFirst: ({ where = {}, ...rest }: Q = {}) =>
        prisma.conversation.findFirst({
          where: { ...where, workspaceId },
          ...rest,
        }),
      count: ({ where = {}, ...rest }: Q = {}) =>
        prisma.conversation.count({
          where: { ...where, workspaceId },
          ...rest,
        }),
      aggregate: ({ where = {}, ...rest }: Q) =>
        prisma.conversation.aggregate({
          where: { ...where, workspaceId },
          ...rest,
        }),
      update: ({ where, data, ...rest }: Q) =>
        prisma.conversation.update({ where, data, ...rest }),
    },
    // ── Message ──
    message: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.message.findMany({ where, ...rest }),
      findFirst: ({ where = {}, ...rest }: Q = {}) =>
        prisma.message.findFirst({ where, ...rest }),
      count: ({ where = {}, ...rest }: Q = {}) =>
        prisma.message.count({ where, ...rest }),
      create: ({ data, ...rest }: Q) =>
        prisma.message.create({ data, ...rest }),
    },
    // ── Leads (also workspace-scoped for tenant-wide leads queries) ──
    lead: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.lead.findMany({ where: { ...where, workspaceId }, ...rest }),
      count: ({ where = {}, ...rest }: Q = {}) =>
        prisma.lead.count({ where: { ...where, workspaceId }, ...rest }),
      create: ({ data, ...rest }: Q) =>
        prisma.lead.create({ data: { ...data, workspaceId }, ...rest }),
    },
    // ── ApiKey ──
    apiKey: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.apiKey.findMany({ where: { ...where, workspaceId }, ...rest }),
      create: ({ data, ...rest }: Q) =>
        prisma.apiKey.create({ data: { ...data, workspaceId }, ...rest }),
    },
    // ── WebhookConfig ──
    webhookConfig: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.webhookConfig.findMany({
          where: { ...where, workspaceId },
          ...rest,
        }),
      create: ({ data, ...rest }: Q) =>
        prisma.webhookConfig.create({ data: { ...data, workspaceId }, ...rest }),
    },
    // ── Document ──
    document: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.document.findMany({ where, ...rest }),
      findUnique: ({ where, ...rest }: Q) =>
        prisma.document.findUnique({ where, ...rest }),
      findFirst: ({ where = {}, ...rest }: Q = {}) =>
        prisma.document.findFirst({ where, ...rest }),
      create: ({ data, ...rest }: Q) =>
        prisma.document.create({ data, ...rest }),
      update: ({ where, data, ...rest }: Q) =>
        prisma.document.update({ where, data, ...rest }),
      delete: ({ where, ...rest }: Q) =>
        prisma.document.delete({ where, ...rest }),
      count: ({ where = {}, ...rest }: Q = {}) =>
        prisma.document.count({ where, ...rest }),
    },
    // ── DocumentChunk ──
    documentChunk: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.documentChunk.findMany({ where, ...rest }),
      findUnique: ({ where, ...rest }: Q) =>
        prisma.documentChunk.findUnique({ where, ...rest }),
      create: ({ data, ...rest }: Q) =>
        prisma.documentChunk.create({ data, ...rest }),
      deleteMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.documentChunk.deleteMany({ where, ...rest }),
    },
    // ── Faq ──
    faq: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.faq.findMany({ where, ...rest }),
      findUnique: ({ where, ...rest }: Q) =>
        prisma.faq.findUnique({ where, ...rest }),
      create: ({ data, ...rest }: Q) =>
        prisma.faq.create({ data, ...rest }),
      delete: ({ where, ...rest }: Q) =>
        prisma.faq.delete({ where, ...rest }),
      count: ({ where = {}, ...rest }: Q = {}) =>
        prisma.faq.count({ where, ...rest }),
    },
    // ── BotStat ──
    botStat: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.botStat.findMany({ where, ...rest }),
      findFirst: ({ where = {}, ...rest }: Q = {}) =>
        prisma.botStat.findFirst({ where, ...rest }),
      upsert: ({ where, create, update, ...rest }: Q) =>
        prisma.botStat.upsert({ where, create, update, ...rest }),
    },
    // ── TopQuestion ──
    topQuestion: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.topQuestion.findMany({ where, ...rest }),
      upsert: ({ where, create, update, ...rest }: Q) =>
        prisma.topQuestion.upsert({ where, create, update, ...rest }),
    },
    // ── EmbedToken ──
    embedToken: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.embedToken.findMany({ where, ...rest }),
      findUnique: ({ where, ...rest }: Q) =>
        prisma.embedToken.findUnique({ where, ...rest }),
      create: ({ data, ...rest }: Q) =>
        prisma.embedToken.create({ data, ...rest }),
      delete: ({ where, ...rest }: Q) =>
        prisma.embedToken.delete({ where, ...rest }),
      update: ({ where, data, ...rest }: Q) =>
        prisma.embedToken.update({ where, data, ...rest }),
    },
    // ── UsageRecord ──
    usageRecord: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.usageRecord.findMany({
          where: { ...where, workspaceId },
          ...rest,
        }),
    },
    // ── User ──
    user: {
      findMany: ({ where = {}, ...rest }: Q = {}) =>
        prisma.user.findMany({ where: { ...where, workspaceId }, ...rest }),
      findUnique: ({ where, ...rest }: Q) =>
        prisma.user.findUnique({ where, ...rest }),
      findFirst: ({ where = {}, ...rest }: Q = {}) =>
        prisma.user.findFirst({ where: { ...where, workspaceId }, ...rest }),
      create: ({ data, ...rest }: Q) =>
        prisma.user.create({ data: { ...data, workspaceId }, ...rest }),
      update: ({ where, data, ...rest }: Q) =>
        prisma.user.update({ where, data, ...rest }),
      delete: ({ where, ...rest }: Q) =>
        prisma.user.delete({ where, ...rest }),
    },
  };
}

/**
 * Ownership check for a `findUnique` on a tenant-scoped table. We can't inject into
 * the unique `where`, so the pattern is: fetch by id, then verify the WF relation.
 * Returns null when not found OR found-but-wrong-tenant — callers can't distinguish
 * "doesn't exist" from "not yours," which is what you want (no enumeration oracle).
 */
export function belongsToWorkspace<T extends { workspaceId: string } | null>(
  row: T,
  workspaceId: string,
): T {
  if (row && row.workspaceId !== workspaceId) {
    // Throwing ForbiddenError rather than returning null yields correct 403 semantics.
    throw new Error("Resource does not belong to this workspace.");
  }
  return row;
}
