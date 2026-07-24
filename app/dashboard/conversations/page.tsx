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
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
          <p className="mt-1 text-sm text-muted-foreground/80">
            Monitor and manage live interactions across all your assistants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter placeholder */}
          <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/40 text-[13px] font-semibold">
            Status: All
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/40 text-[13px] font-semibold">
            Sort: Newest
          </Button>
        </div>
      </div>

      {conversations.length === 0 ? (
        <Card className="border-border/40 bg-background shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="mt-6 text-[15px] font-bold">No conversations yet</h3>
            <p className="mt-2 max-w-sm text-[14px] text-muted-foreground">
              They&apos;ll appear here automatically as soon as users start interacting with your bots.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/40 bg-background shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {conversations.map((conv) => {
                const status = statusConfig[conv.status] ?? statusConfig.OPEN!;
                const lastMessage = conv.messages[0];

                return (
                  <Link
                    key={conv.id}
                    href={`/dashboard/conversations/${conv.id}`}
                    className="group block transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-6 px-6 py-5">
                      {/* Bot Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[12px] font-bold text-primary uppercase transition-transform group-hover:scale-105">
                        {conv.bot?.name?.[0] ?? "B"}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] font-bold text-foreground/90">
                            {conv.bot?.name ?? "Assistant"}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                              conv.status === "OPEN" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                            )}
                          >
                            {status.label}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-[13px] font-medium text-muted-foreground/70">
                          {lastMessage?.content?.slice(0, 100) ?? "No messages yet"}
                        </p>
                      </div>

                      {/* Meta Rail */}
                      <div className="hidden shrink-0 items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 sm:flex">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" />
                          {conv.messageCount}
                        </div>

                        {conv.avgResponseMs && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {(conv.avgResponseMs / 1000).toFixed(1)}s
                          </div>
                        )}

                        <div className="flex w-16 justify-center">
                          {conv.satisfaction === "UP" && (
                            <ThumbsUp className="h-3.5 w-3.5 text-success/70" />
                          )}
                          {conv.satisfaction === "DOWN" && (
                            <ThumbsDown className="h-3.5 w-3.5 text-destructive/70" />
                          )}
                        </div>

                        <div className="w-20 text-right">
                          {new Date(conv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
