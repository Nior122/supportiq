/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Bot detail/settings page. This is the main management page for a single bot.
 * It shows:
 *  - Bot status, model info, and key metrics
 *  - Tabs for: Settings, Knowledge Base, Appearance, Embed Code
 *
 * The bot is identified by its `publicId` (the `:botId` route parameter). The
 * page fetches bot data server-side and passes it to the client-side settings
 * form which handles updates.
 *
 * The route uses `[botId]` (dynamic segment) not `[[...slug]]` — bots have
 * exactly one identifier, so catch-all routes would add unnecessary complexity.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { getBotByPublicId, getBotStats } from "@/services/bot";
import { BotSettingsForm } from "./bot-settings-form";
import { EmbedCode } from "./embed-code";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Clock, BarChart3, ArrowRight, Palette, FlaskConical, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  DRAFT: { label: "Draft", variant: "secondary" },
  PAUSED: { label: "Paused", variant: "warning" },
};

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card className="border-border/40 bg-background/50 shadow-sm transition-all hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</p>
          <p className="text-xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function BotDetailPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const session = await requireSession();

  let bot;
  try {
    bot = await getBotByPublicId(session.workspaceId!, botId);
  } catch {
    notFound();
  }

  let stats;
  try {
    stats = await getBotStats(session.workspaceId!, botId);
  } catch {
    stats = null;
  }

  const status = statusConfig[bot.status] ?? statusConfig.DRAFT!;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <Bot size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{bot.name}</h1>
              <Badge 
                variant="secondary" 
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  bot.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                )}
              >
                {status.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm font-medium text-muted-foreground/80">
              {bot.modelProvider.toLowerCase()} · {bot.modelId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="h-10 rounded-full px-5 text-[13px] font-semibold" asChild>
            <Link href={`/dashboard/bots/${botId}/customize`}>
              <Palette className="mr-2 h-4 w-4" />
              Customize
            </Link>
          </Button>
          <Button className="h-10 rounded-full px-6 font-semibold shadow-premium" asChild>
            <Link href={`/dashboard/bots/${botId}/test`}>
              <FlaskConical className="mr-2 h-4 w-4" />
              Test bot
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Conversations" value={stats?.conversationCount ?? 0} icon={MessageSquare} />
        <MetricCard label="Knowledge Base" value={`${stats?.documentCount ?? 0} docs`} icon={FileText} />
        <MetricCard 
          label="Avg Response" 
          value={stats?.avgResponseMs != null ? `${Math.round(stats.avgResponseMs)}ms` : "—"} 
          icon={Clock} 
        />
        <MetricCard label="Today's Active" value={stats?.todayMessages ?? 0} icon={BarChart3} />
      </div>

      {/* Management interface */}
      <Tabs defaultValue="settings" className="space-y-8">
        <div className="border-b border-border/40">
          <TabsList className="h-10 gap-8 bg-transparent p-0">
            <TabsTrigger 
              value="settings" 
              className="relative h-10 rounded-none border-b-2 border-transparent px-0 pb-3 pt-2 text-[13px] font-semibold text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              General Settings
            </TabsTrigger>
            <TabsTrigger 
              value="knowledge" 
              className="relative h-10 rounded-none border-b-2 border-transparent px-0 pb-3 pt-2 text-[13px] font-semibold text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger 
              value="embed" 
              className="relative h-10 rounded-none border-b-2 border-transparent px-0 pb-3 pt-2 text-[13px] font-semibold text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              Widget Embed
            </TabsTrigger>
            <TabsTrigger 
              value="test" 
              className="relative h-10 rounded-none border-b-2 border-transparent px-0 pb-3 pt-2 text-[13px] font-semibold text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              Interactive Test
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
          <BotSettingsForm bot={bot} />
        </TabsContent>

        <TabsContent value="knowledge" className="mt-0 focus-visible:outline-none">
          <Card className="border-border/40 bg-background shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-[15px] font-bold text-foreground/90">Knowledge Base Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-8 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
                Feed your bot with PDFs, crawl websites, or add custom FAQs. The more context you provide, the smarter it becomes.
              </p>
              <Button size="lg" className="h-11 rounded-xl px-8 font-semibold shadow-premium" asChild>
                <Link href={`/dashboard/bots/${botId}/knowledge`}>
                  Manage Sources
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="mt-0 focus-visible:outline-none">
          <div className="mx-auto max-w-2xl">
            <Card className="h-[600px] overflow-hidden rounded-3xl border-border/40 bg-background shadow-elevated">
              <CardContent className="h-full p-0">
                <ChatWidget
                  key={bot.publicId}
                  botPublicId={bot.publicId}
                  botName={bot.name}
                  greeting={
                    bot.greeting ?? `Hi! I'm ${bot.name}. How can I help you today?`
                  }
                />
              </CardContent>
            </Card>
            <p className="mt-4 text-center text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
              Live Preview Mode
            </p>
          </div>
        </TabsContent>

        <TabsContent value="embed" className="mt-0 focus-visible:outline-none">
          <EmbedCode botPublicId={botId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
