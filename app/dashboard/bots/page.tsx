/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Bot list page — shows all bots in the workspace. Each bot card displays:
 *  - Bot name, status badge, model info
 *  - Document count, conversation count, FAQ count
 *  - Quick actions (edit, pause/resume, delete)
 *
 * This is a Server Component that fetches the bot list server-side for fast
 * initial render. The list is static per-request (no client-side fetching needed
 * for a list that typically has <20 items).
 */
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { listBots } from "@/services/bot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Bot,
  MessageSquare,
  FileText,
  MoreHorizontal,
  Settings,
  FlaskConical,
  Palette,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  DRAFT: { label: "Draft", variant: "secondary" },
  PAUSED: { label: "Paused", variant: "warning" },
};

export default async function BotsPage() {
  const session = await requireSession();
  const bots = await listBots(session.workspaceId!);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bots</h1>
          <p className="text-muted-foreground">
            Manage your AI support bots. Each bot can have its own knowledge base and settings.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/bots/new">
            <Plus className="mr-2 h-4 w-4" />
            New Bot
          </Link>
        </Button>
      </div>

      {bots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No bots yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first AI support bot and train it on your business knowledge.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/bots/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Bot
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => {
            const status = statusConfig[bot.status] ?? statusConfig.DRAFT!;
            return (
              <Card
                key={bot.id}
                className="group relative transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">
                      {bot.name}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {bot.modelProvider.toLowerCase()} · {bot.modelId}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/bots/${bot.publicId}/test`}>
                          <FlaskConical className="mr-2 h-4 w-4" />
                          Test bot
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/bots/${bot.publicId}`}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/bots/${bot.publicId}/customize`}>
                          <Palette className="mr-2 h-4 w-4" />
                          Customize appearance
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {bot._count.documents} docs
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {bot._count.conversations} convos
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/bots/${bot.publicId}`}
                    className="mt-4 block"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Bot →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
