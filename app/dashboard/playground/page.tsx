/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Bot playground page — a sandbox where users can test their bots before
 * deploying them. Shows a live chat widget alongside the bot's configuration
 * (model, temperature, system prompt) so users can iterate quickly.
 *
 * The playground is accessible from the bot detail page and from the sidebar.
 * It uses the same ChatWidget component as the embeddable widget, ensuring
 * what users see in the playground is exactly what visitors will experience.
 */
import { requireSession } from "@/lib/auth/session";
import { listBots } from "@/services/bot";
import { PlaygroundClient } from "./playground-client";

export default async function PlaygroundPage() {
  const session = await requireSession();
  const bots = await listBots(session.workspaceId!);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Playground</h1>
        <p className="text-muted-foreground">
          Test your bots in real-time. Select a bot and start chatting.
        </p>
      </div>

      <PlaygroundClient bots={bots} />
    </div>
  );
}
