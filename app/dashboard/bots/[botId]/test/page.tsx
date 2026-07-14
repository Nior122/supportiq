/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Per-bot test playground. Renders the shared `ChatWidget` against a single bot
 * so the owner can chat with exactly that bot without selecting from a dropdown.
 * This is the "Test bot" entry point surfaced from the bot card dropdown and the
 * bot detail page's Test tab.
 *
 * Reuses `ChatWidget` (the same component the embed widget uses), so what you
 * see here is what visitors experience. The widget streams from POST /api/chat.
 *
 * The bot must be ACTIVE for /api/chat to respond — a PAUSED/DRAFT bot returns
 * 403 and the widget surfaces the error in-chat. We still render the widget so
 * the owner sees the message rather than a separate empty state.
 */
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getBotByPublicId } from "@/services/bot";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TestBotPage({
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

  const greeting =
    bot.greeting ?? `Hi! I'm ${bot.name}. How can I help you today?`;

  const isActive = bot.status === "ACTIVE";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Test {bot.name}</h1>
            <Badge variant={isActive ? "success" : "warning"}>
              {isActive ? "Active" : bot.status.toLowerCase()}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Send messages to test this bot&apos;s behavior. Responses stream from
            the same endpoint visitors use.
          </p>
        </div>
      </div>

      {!isActive && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          This bot is <span className="font-medium">{bot.status}</span>. The chat
          API only responds to <span className="font-medium">ACTIVE</span> bots;
          set it to Active on the Settings tab to test it here.
        </div>
      )}

      <Card className="h-[calc(100dvh-260px)]">
        <CardContent className="h-full p-0">
          <ChatWidget key={bot.publicId} botPublicId={bot.publicId} greeting={greeting} />
        </CardContent>
      </Card>
    </div>
  );
}
