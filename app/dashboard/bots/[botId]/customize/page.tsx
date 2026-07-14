/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Bot appearance/customization page. This is the route linked from the bot card
 * dropdown ("Customize appearance"). Previously this folder only held a
 * `.gitkeep`, so visiting the link 404'd. The Bot model already has appearance
 * fields (greeting, welcomeMessage, quickReplies, avatarUrl, logoUrl, the
 * `appearance` JSON), so this page edits them directly.
 *
 * The route mirrors the bot detail/settings page: dynamic `[botId]` segment maps
 * to the bot's `publicId`; we resolve the workspace from the session and fetch
 * server-side, then hand off to a client form for editing.
 */
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getBotByPublicId } from "@/services/bot";
import { CustomizeForm } from "./customize-form";

export default async function CustomizePage({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customize</h1>
        <p className="text-muted-foreground">
          Tune the chat widget appearance and conversation greeting for{" "}
          <span className="font-medium text-foreground">{bot.name}</span>.
        </p>
      </div>

      <CustomizeForm bot={bot} />
    </div>
  );
}
