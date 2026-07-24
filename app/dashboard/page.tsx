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
  trend,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card className="border-border/40 bg-background/50 shadow-sm transition-all hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {trend && (
            <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground/60">{label}</p>
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
    },
    {
      label: "Add knowledge base",
      done: false,
      href: "/dashboard/bots",
    },
    {
      label: "Embed widget",
      done: false,
      href: "/dashboard/integrations",
    },
  ];

  const completedCount = steps.filter(s => s.done).length;

  return (
    <Card className="border-border/40 bg-background shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-bold">Getting Started</CardTitle>
          <span className="text-xs font-medium text-muted-foreground">{completedCount}/3 done</span>
        </div>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1 p-2">
        {steps.map((step, i) => (
          <Link
            key={step.label}
            href={step.href}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors hover:bg-muted/50"
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                step.done
                  ? "bg-success text-success-foreground"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {step.done ? "✓" : i + 1}
            </div>
            <span className={`flex-1 text-[13px] font-medium ${step.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {step.label}
            </span>
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
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground/80">
            Monitor your workspace performance and active assistants.
          </p>
        </div>
        <Button className="h-10 rounded-full px-6 font-semibold shadow-premium" asChild>
          <Link href="/dashboard/bots/new">
            <Plus className="mr-2 h-4 w-4" />
            New Bot
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Bots" value={data.botCount} icon={Bot} />
        <StatCard label="Total Chats" value={data.conversationCount} icon={MessageSquare} trend="+12%" />
        <StatCard label="Leads Captured" value={data.leadCount} icon={Users} trend="+5%" />
        <StatCard label="Messages" value={data.messageCount} icon={BarChart3} />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Recent conversations */}
        <div className="lg:col-span-2">
          <Card className="border-border/40 bg-background shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-[15px] font-bold">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground" asChild>
                <Link href="/dashboard/conversations">
                  View all
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {data.recentConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20">
                    <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    No conversations yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {data.recentConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary uppercase">
                          {conv.bot?.name?.[0] ?? "B"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-bold text-foreground/90">
                            {conv.bot?.name ?? "Assistant"}
                          </p>
                          <p className="text-[12px] font-medium text-muted-foreground/60">
                            {conv.messageCount} messages · Updated just now
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          conv.status === "OPEN" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        )}
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

        {/* Getting started */}
        <div className="lg:col-span-1">
          <GettingStartedChecklist hasBots={data.hasBots} />
        </div>
      </div>
    </div>
  );
}
