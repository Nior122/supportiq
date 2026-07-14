/**
 * WHY THIS FILE EXISTS
 * -------------------
 * The iframe page that renders inside the embed widget. This is a completely
 * separate page from the dashboard — it runs in a cross-origin iframe with NO
 * access to Clerk auth cookies, dashboard state, or any sensitive data.
 *
 * Security boundary:
 *  - No ClerkProvider, no auth cookies, no session context
 *  - Only receives `botId` via URL search params (public, not secret)
 *  - Chat requests go through POST /api/chat which validates the embed token
 *  - The iframe origin is different from the dashboard origin
 *
 * This page renders the ChatWidget component in a minimal full-height layout
 * with no dashboard chrome — just the chat interface.
 */
import { ChatWidget } from "@/components/chat/chat-widget";
import { prisma } from "@/lib/prisma";

interface EmbedChatPageProps {
  searchParams: Promise<{ botId?: string; theme?: string }>;
}

export default async function EmbedChatPage({ searchParams }: EmbedChatPageProps) {
  const params = await searchParams;
  const botId = params.botId;

  if (!botId) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
        Missing bot ID
      </div>
    );
  }

  // Look up bot config (minimal — no workspace data, no auth)
  const bot = await prisma.bot.findUnique({
    where: { publicId: botId },
    select: {
      id: true,
      status: true,
      greeting: true,
      appearance: true,
      quickReplies: true,
    },
  });

  if (!bot || bot.status !== "ACTIVE") {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
        This chat is currently unavailable
      </div>
    );
  }

  // Apply bot appearance settings
  const appearance = bot.appearance as Record<string, string> | null;
  const primaryColor = appearance?.primaryColor ?? "#6366f1";

  return (
    <div
      className="flex h-dvh flex-col bg-background"
      style={
        {
          "--primary": primaryColor,
        } as React.CSSProperties
      }
    >
      <ChatWidget
        botPublicId={botId}
        greeting={bot.greeting ?? undefined}
        quickReplies={bot.quickReplies as string[]}
      />
    </div>
  );
}
