/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Bot CRUD service. Encapsulates all Prisma operations for bots scoped to a
 * workspace. The service layer sits between server actions (which handle
 * request/response) and the database (which should never be directly accessed
 * from actions).
 *
 * All queries are scoped to `workspaceId` via the scoped Prisma proxy. The
 * `publicId` field is the external-facing identifier — it's a cuid generated
 * separately from the internal `id` so we can rotate the public ID without
 * breaking FK references.
 */
import { prisma } from "@/lib/prisma";
import { scopedPrisma, belongsToWorkspace } from "@/lib/auth/scoped";
import { isUniqueConstraintError } from "@/lib/prisma";
import type { Bot, Prisma } from "@prisma/client";

const sp = scopedPrisma({} as { workspaceId: string });

/** Create a new bot in the workspace. Returns the created bot. */
export async function createBot(
  workspaceId: string,
  data: {
    name: string;
    modelProvider?: string;
    modelId?: string;
    systemPrompt?: string | null;
    persona?: string | null;
    language?: string;
    greeting?: string | null;
  },
): Promise<Bot> {
  // Neon HTTP adapter doesn't support transactions, so we can't use
  // `workspace: { connect }` (BotCreateInput). Use scalar FKs directly.
  // Strip undefined/null optional values — Prisma serializes them as {} in SQL.
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== null),
  ) as Record<string, unknown>;

  const createData = {
    ...clean,
    workspaceId,
  };
  console.log("[createBot] data being sent to Prisma:", JSON.stringify(createData, (_k, v) => v === undefined ? "UNDEFINED" : v, 2));

  return prisma.bot.create({
    data: createData as Prisma.BotUncheckedCreateInput,
  });
}

/** Get a bot by public ID, verified to belong to the workspace. */
export async function getBotByPublicId(
  workspaceId: string,
  publicId: string,
): Promise<Bot> {
  const scoped = scopedPrisma({ workspaceId });
  const bot = await scoped.bot.findUnique({
    where: { publicId },
  });
  if (!bot) throw new Error("Bot not found");
  belongsToWorkspace(bot, workspaceId);
  return bot;
}

/** List all bots in the workspace, with document and conversation counts. */
export async function listBots(workspaceId: string) {
  return prisma.bot.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          documents: true,
          conversations: true,
        },
      },
    },
  });
}

/** Update a bot's settings. */
export async function updateBot(
  workspaceId: string,
  publicId: string,
  data: Prisma.BotUpdateInput,
): Promise<Bot> {
  // Verify ownership first
  await getBotByPublicId(workspaceId, publicId);

  const scoped = scopedPrisma({ workspaceId });
  try {
    return await scoped.bot.update({
      where: { publicId },
      data,
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error("A bot with that name already exists");
    }
    throw err;
  }
}

/** Delete a bot and cascade (Prisma handles FK cascades). */
export async function deleteBot(
  workspaceId: string,
  publicId: string,
): Promise<void> {
  await getBotByPublicId(workspaceId, publicId);

  const scoped = scopedPrisma({ workspaceId });
  await scoped.bot.delete({ where: { publicId } });
}

/** Get bot summary stats for the overview page. */
export async function getBotStats(workspaceId: string, botPublicId: string) {
  const bot = await prisma.bot.findUnique({
    where: { publicId: botPublicId },
    include: {
      _count: {
        select: {
          documents: true,
          conversations: true,
          faqs: true,
        },
      },
    },
  });

  if (!bot) throw new Error("Bot not found");
  belongsToWorkspace(bot, workspaceId);

  // Get recent conversation stats
  const recentStats = await prisma.conversation.aggregate({
    where: { botId: bot.id },
    _avg: { avgResponseMs: true },
    _count: true,
  });

  // Get today's message count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayMessages = await prisma.message.count({
    where: {
      conversation: { botId: bot.id },
      createdAt: { gte: today },
    },
  });

  return {
    ...bot,
    documentCount: bot._count.documents,
    conversationCount: bot._count.conversations,
    faqCount: bot._count.faqs,
    avgResponseMs: recentStats._avg.avgResponseMs,
    todayMessages,
  };
}
