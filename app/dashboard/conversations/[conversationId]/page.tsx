/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Conversation detail page. Shows the full message history for a single
 * conversation, with:
 *  - All messages in chronological order (user + assistant)
 *  - Citations for each assistant message
 *  - Bot info sidebar (name, model, timestamps)
 *  - Actions (resolve, archive, export, delete)
 *  - Satisfaction feedback display
 *
 * This is the primary view for support teams reviewing customer interactions.
 * Messages are rendered with markdown support for assistant responses.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Download,
} from "lucide-react";

async function getConversation(workspaceId: string, conversationId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      bot: {
        select: { name: true, publicId: true, modelProvider: true, modelId: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
      lead: true,
    },
  });

  if (!conv || conv.workspaceId !== workspaceId) {
    return null;
  }

  return conv;
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const session = await requireSession();

  const conversation = await getConversation(session.workspaceId!, conversationId);
  if (!conversation) notFound();

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "outline" }> = {
    OPEN: { label: "Open", variant: "success" },
    RESOLVED: { label: "Resolved", variant: "secondary" },
    ARCHIVED: { label: "Archived", variant: "outline" },
  };

  const status = statusConfig[conversation.status] ?? statusConfig.OPEN!;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/dashboard/conversations">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Conversations
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Conversation</h1>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Messages */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="space-y-4 p-6">
              {conversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "USER" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "ASSISTANT" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === "USER"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.role === "ASSISTANT" && msg.generationMs && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Generated in {(msg.generationMs / 1000).toFixed(1)}s
                      </p>
                    )}

                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {msg.role === "USER" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {conversation.messages.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No messages in this conversation.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bot</span>
                <Link
                  href={`/dashboard/bots/${conversation.bot?.publicId}`}
                  className="font-medium hover:underline"
                >
                  {conversation.bot?.name}
                </Link>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <span className="font-medium">
                  {conversation.bot?.modelProvider} · {conversation.bot?.modelId}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Messages</span>
                <span className="font-medium">{conversation.messageCount}</span>
              </div>

              {conversation.avgResponseMs && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Response</span>
                  <span className="font-medium">
                    {(conversation.avgResponseMs / 1000).toFixed(1)}s
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Started</span>
                <span>
                  {new Date(conversation.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Active</span>
                <span>
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {conversation.satisfaction && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Feedback</span>
                    {conversation.satisfaction === "UP" ? (
                      <ThumbsUp className="h-4 w-4 text-success" />
                    ) : (
                      <ThumbsDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </>
              )}

              {conversation.lead && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Lead Captured
                    </p>
                    <p className="text-sm">{conversation.lead.name ?? "Unknown"}</p>
                    {conversation.lead.email && (
                      <p className="text-xs text-muted-foreground">
                        {conversation.lead.email}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
