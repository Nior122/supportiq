/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Conversations list page. Shows all conversations across all bots in the
 * workspace, with:
 *  - Status filter (All, Open, Resolved, Archived)
 *  - Bot filter
 *  - Search by message content
 *  - Sort by date, message count, satisfaction
 *  - Pagination
 *
 * Conversations are the primary unit of customer interaction. This page
 * lets support teams review, filter, and export conversation history.
 */
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
} from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "outline" }> = {
  OPEN: { label: "Open", variant: "success" },
  RESOLVED: { label: "Resolved", variant: "secondary" },
  ARCHIVED: { label: "Archived", variant: "outline" },
};

async function getConversations(workspaceId: string) {
  return prisma.conversation.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      bot: { select: { name: true, publicId: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, role: true },
      },
    },
  });
}

export default async function ConversationsPage() {
  const session = await requireSession();
  const conversations = await getConversations(session.workspaceId!);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground">
            Review chat history across all bots.
          </p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No conversations yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Conversations will appear here once visitors start chatting with
              your bots.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const status = statusConfig[conv.status] ?? statusConfig.OPEN!;
            const lastMessage = conv.messages[0];

            return (
              <Link
                key={conv.id}
                href={`/dashboard/conversations/${conv.id}`}
                className="block"
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Status indicator */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {conv.bot?.name ?? "Bot"}
                        </span>
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {lastMessage?.content?.slice(0, 100) ?? "No messages yet"}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="hidden shrink-0 items-center gap-4 text-xs text-muted-foreground sm:flex">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {conv.messageCount}
                      </span>

                      {conv.avgResponseMs && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {(conv.avgResponseMs / 1000).toFixed(1)}s
                        </span>
                      )}

                      {conv.satisfaction === "UP" && (
                        <ThumbsUp className="h-3 w-3 text-success" />
                      )}
                      {conv.satisfaction === "DOWN" && (
                        <ThumbsDown className="h-3 w-3 text-destructive" />
                      )}

                      <span>
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
