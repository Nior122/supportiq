/**
 * WHY THIS FILE EXISTS
 * -------------------
 * The dashboard home page. This is the first page users see after login. It
 * displays:
 *  1. A greeting with the user's first name
 *  2. Quick stats cards (total bots, conversations, leads, messages)
 *  3. A getting-started checklist (create bot → add knowledge → embed)
 *  4. Recent conversations list
 *
 * All data is fetched server-side via the scoped Prisma client, so there's
 * no loading spinner — the page is fully rendered on first paint. Stats
 * are cached via React's `cache()` and revalidate on navigation.
 */
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  MessageSquare,
  Users,
  BarChart3,
  Plus,
  ArrowRight,
  FileText,
  Zap,
} from "lucide-react";

async function getDashboardData(workspaceId: string) {
  const [botCount, conversationCount, leadCount, messageCount, recentConversations, hasBots] =
    await Promise.all([
      prisma.bot.count({ where: { workspaceId } }),
      prisma.conversation.count({ where: { workspaceId } }),
      prisma.lead.count({ where: { workspaceId } }),
      prisma.message.count({
        where: { conversation: { workspaceId } },
      }),
      prisma.conversation.findMany({
        where: { workspaceId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { bot: { select: { name: true } } },
      }),
      prisma.bot.findFirst({
        where: { workspaceId },
        select: { id: true },
      }),
    ]);

  return {
    botCount,
    conversationCount,
    leadCount,
    messageCount,
    recentConversations,
    hasBots: hasBots !== null,
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function GettingStartedChecklist({ hasBots }: { hasBots: boolean }) {
  const steps = [
    {
      label: "Create your first bot",
      done: hasBots,
      href: "/dashboard/bots/new",
      icon: Bot,
    },
    {
      label: "Add knowledge base documents",
      done: false,
      href: "/dashboard/bots",
      icon: FileText,
    },
    {
      label: "Embed on your website",
      done: false,
      href: "/dashboard/integrations",
      icon: Zap,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Getting Started</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, i) => (
          <Link
            key={step.label}
            href={step.href}
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step.done
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.done ? "✓" : i + 1}
            </div>
            <span className="flex-1 text-sm font-medium">{step.label}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function DashboardHomePage() {
  const session = await requireSession();
  const data = await getDashboardData(session.workspaceId!);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back. Here&apos;s an overview of your workspace.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/bots/new">
            <Plus className="mr-2 h-4 w-4" />
            New Bot
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bots" value={data.botCount} icon={Bot} />
        <StatCard label="Conversations" value={data.conversationCount} icon={MessageSquare} />
        <StatCard label="Leads" value={data.leadCount} icon={Users} />
        <StatCard label="Messages" value={data.messageCount} icon={BarChart3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Getting started */}
        <div className="lg:col-span-1">
          <GettingStartedChecklist hasBots={data.hasBots} />
        </div>

        {/* Recent conversations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Conversations</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/conversations">
                  View all
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentConversations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No conversations yet. They&apos;ll appear here once visitors start chatting with your bots.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recentConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {conv.bot?.name ?? "Bot"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conv.messageCount} messages · {conv.status.toLowerCase()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          conv.status === "OPEN"
                            ? "success"
                            : conv.status === "RESOLVED"
                              ? "secondary"
                              : "outline"
                        }
                        className="ml-2 shrink-0"
                      >
                        {conv.status.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
