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
import { MessageSquare, FileText, Clock, BarChart3, ArrowRight, Palette, FlaskConical } from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  DRAFT: { label: "Draft", variant: "secondary" },
  PAUSED: { label: "Paused", variant: "warning" },
};

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{bot.name}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {bot.modelProvider.toLowerCase()} · {bot.modelId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/bots/${botId}/customize`}>
              <Palette className="mr-2 h-4 w-4" />
              Customize
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/bots/${botId}/test`}>
              <FlaskConical className="mr-2 h-4 w-4" />
              Test Bot
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Conversations</p>
              <p className="text-lg font-bold">{stats?.conversationCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Documents</p>
              <p className="text-lg font-bold">{stats?.documentCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Avg Response</p>
              <p className="text-lg font-bold">
                {stats?.avgResponseMs != null ? `${Math.round(stats.avgResponseMs)}ms` : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Today&apos;s Messages</p>
              <p className="text-lg font-bold">{stats?.todayMessages ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings tabs */}
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <BotSettingsForm bot={bot} />
        </TabsContent>

        <TabsContent value="test">
          <Card className="h-[calc(100dvh-360px)]">
            <CardContent className="h-full p-0">
              <ChatWidget
                key={bot.publicId}
                botPublicId={bot.publicId}
                greeting={
                  bot.greeting ?? `Hi! I'm ${bot.name}. How can I help you today?`
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload documents, add websites, and manage FAQ entries to train your bot.
              </p>
              <Button asChild>
                <Link href={`/dashboard/bots/${botId}/knowledge`}>
                  Manage Knowledge Base
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <EmbedCode botPublicId={botId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
