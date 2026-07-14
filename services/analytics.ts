/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Analytics service. Provides aggregated data for the analytics dashboard using
 * the pre-computed rollup tables (`BotStat`, `UsageRecord`, `TopQuestion`)
 * instead of running COUNT(*) queries over millions of messages.
 *
 * The rollup strategy:
 *  - `BotStat` is updated periodically (every hour or on message insert batch)
 *    with daily aggregates per bot (message count, unique sessions, avg response
 *    time, satisfaction scores).
 *  - `UsageRecord` rolls up at the workspace level for billing-relevant metrics.
 *  - `TopQuestion` normalizes and counts repeated questions for the "hot questions"
 *    dashboard widget.
 *
 * For real-time counts (today's messages, etc.), we still query the Message table
 * directly — the volume is small enough that it doesn't need pre-aggregation.
 */
import { prisma } from "@/lib/prisma";
import { scopedPrisma } from "@/lib/auth/scoped";

export interface AnalyticsOverview {
  totalConversations: number;
  totalMessages: number;
  totalLeads: number;
  avgResponseMs: number;
  conversationsTrend: number; // percentage change vs previous period
  messagesTrend: number;
  leadsTrend: number;
}

export interface TimeSeriesPoint {
  date: string;
  conversations: number;
  messages: number;
  leads: number;
}

export interface TopQuestionRow {
  question: string;
  count: number;
}

/**
 * Get the analytics overview for a workspace.
 * Compares current period to previous period for trend calculations.
 */
export async function getAnalyticsOverview(
  workspaceId: string,
  dateRange: { from: Date; to: Date },
): Promise<AnalyticsOverview> {
  const scoped = scopedPrisma({ workspaceId });

  const { from, to } = dateRange;

  // Calculate previous period for trend comparison
  const periodMs = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - periodMs);
  const prevTo = from;

  const [
    totalConversations,
    totalMessages,
    totalLeads,
    avgResponse,
    prevConversations,
    prevMessages,
    prevLeads,
  ] = await Promise.all([
    scoped.conversation.count({
      where: { createdAt: { gte: from, lte: to } },
    }),
    scoped.message.count({
      where: {
        conversation: { workspaceId },
        createdAt: { gte: from, lte: to },
      },
    }),
    scoped.lead.count({
      where: { createdAt: { gte: from, lte: to } },
    }),
    prisma.conversation.aggregate({
      where: { workspaceId, createdAt: { gte: from, lte: to } },
      _avg: { avgResponseMs: true },
    }),
    scoped.conversation.count({
      where: { createdAt: { gte: prevFrom, lte: prevTo } },
    }),
    scoped.message.count({
      where: {
        conversation: { workspaceId },
        createdAt: { gte: prevFrom, lte: prevTo },
      },
    }),
    scoped.lead.count({
      where: { createdAt: { gte: prevFrom, lte: prevTo } },
    }),
  ]);

  function trend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  return {
    totalConversations,
    totalMessages,
    totalLeads,
    avgResponseMs: avgResponse._avg.avgResponseMs ?? 0,
    conversationsTrend: trend(totalConversations, prevConversations),
    messagesTrend: trend(totalMessages, prevMessages),
    leadsTrend: trend(totalLeads, prevLeads),
  };
}

/**
 * Get time-series data for charts.
 * Returns daily counts for conversations, messages, and leads.
 */
export async function getTimeSeriesData(
  workspaceId: string,
  dateRange: { from: Date; to: Date },
): Promise<TimeSeriesPoint[]> {
  const scoped = scopedPrisma({ workspaceId });

  // Use BotStat rollup table for message counts by date
  const botStats = await scoped.botStat.findMany({
    where: {
      bot: { workspaceId },
      date: { gte: dateRange.from, lte: dateRange.to },
    },
    orderBy: { date: "asc" },
    select: {
      date: true,
      messages: true,
      conversations: true,
    },
  });

  // Group by date
  const dateMap = new Map<string, TimeSeriesPoint>();

  for (const stat of botStats) {
    const dateKey = stat.date.toISOString().split("T")[0]!;
    const existing = dateMap.get(dateKey) ?? {
      date: dateKey,
      conversations: 0,
      messages: 0,
      leads: 0,
    };
    existing.messages += stat.messages;
    existing.conversations += stat.conversations;
    dateMap.set(dateKey, existing);
  }

  // Fill in missing dates with zeros
  const result: TimeSeriesPoint[] = [];
  const current = new Date(dateRange.from);
  while (current <= dateRange.to) {
    const dateKey = current.toISOString().split("T")[0]!;
    result.push(dateMap.get(dateKey) ?? { date: dateKey, conversations: 0, messages: 0, leads: 0 });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Get top questions asked to bots in the workspace.
 */
export async function getTopQuestions(
  workspaceId: string,
  limit: number = 10,
): Promise<TopQuestionRow[]> {
  const scoped = scopedPrisma({ workspaceId });

  const questions = await scoped.topQuestion.findMany({
    where: { bot: { workspaceId } },
    orderBy: { count: "desc" },
    take: limit,
    select: {
      normalizedQuestion: true,
      count: true,
    },
  });

  return questions.map((q) => ({
    question: q.normalizedQuestion,
    count: q.count,
  }));
}

/**
 * Get satisfaction scores (thumbs up/down) for a workspace.
 */
export async function getSatisfactionScores(
  workspaceId: string,
  dateRange: { from: Date; to: Date },
) {
  const scoped = scopedPrisma({ workspaceId });

  const [upCount, downCount] = await Promise.all([
    scoped.conversation.count({
      where: {
        workspaceId,
        satisfaction: "UP",
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      },
    }),
    scoped.conversation.count({
      where: {
        workspaceId,
        satisfaction: "DOWN",
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      },
    }),
  ]);

  return {
    up: upCount,
    down: downCount,
    total: upCount + downCount,
    score: upCount + downCount > 0 ? Math.round((upCount / (upCount + downCount)) * 100) : 0,
  };
}
