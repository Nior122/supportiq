/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Reusable chat widget component. Used in both:
 *  1. The dashboard playground (for testing bots)
 *  2. The embeddable widget (iframe version)
 *
 * It handles the full chat lifecycle:
 *  - Rendering the message list with markdown
 *  - Sending messages via POST /api/chat
 *  - Streaming responses token-by-token
 *  - Auto-scrolling to the latest message
 *  - Citation display
 *
 * The component is fully self-contained — it takes a `botPublicId` and
 * optionally a `greeting` message, and manages all state internally.
 * No external state management needed for a single conversation.
 */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { TypingIndicator } from "./typing-indicator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    content: string;
    documentName: string;
    heading: string | null;
    similarity: number;
  }>;
  /**
   * Transient typing-indicator status for an in-flight assistant message,
   * driven by the inband `§STATUS:researching§` / `§STATUS:typing§` sentinels
   * the chat route emits before the first text token. Cleared (set to
   * undefined) once real text starts populating the bubble.
   */
  typingStatus?: "researching" | "typing";
}

interface ChatWidgetProps {
  botPublicId: string;
  botName?: string;
  greeting?: string;
  quickReplies?: string[];
  className?: string;
}

export function ChatWidget({
  botPublicId,
  botName,
  greeting,
  quickReplies = [],
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add greeting message on mount
  useEffect(() => {
    if (greeting) {
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content: greeting,
        },
      ]);
    }
  }, [greeting]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
      };

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        // Show the Researching pill immediately, before the HTTP response even
        // arrives — the route will refine this to "typing" via its first sentinel.
        typingStatus: "researching",
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput("");
      setIsLoading(true);

      try {
        // Build message history for context
        const apiMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            botPublicId,
            messages: apiMessages,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to send message");
        }

        // Stream the response. The route prepends inband STATUS sentinels
        // (§STATUS:researching§ / §STATUS:typing§) before the real text. We must
        // CONSUME these here so they drive the typing indicator and never reach
        // the rendered message or the accumulated text.
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        // `pending` holds decoded bytes that haven't been committed to
        // `accumulated` yet. A sentinel can straddle a chunk boundary, so we only
        // commit up to a safe boundary — the byte run before any pending partial
        // sentinel (a trailing "§") is committed; everything from the last "§"
        // onward is held here until the next chunk completes or disproves it.
        let pending = "";
        let lastStatus: "researching" | "typing" | undefined;
        const SENTINEL = /§STATUS:(researching|typing)§/g;

        // Pull complete sentinels out of `pending`, record the latest status they
        // carry, and commit all text that isn't part of an in-progress sentinel.
        // Returns the committed text; leaves any trailing partial sentinel (or
        // leftover bytes) in `pending`.
        const commitSafeText = (id: string): string => {
          let committed = "";
          SENTINEL.lastIndex = 0;
          // Walk through `pending`, consuming full sentinels and keeping any text
          // before them. We re-run after each sentinel because sentinels can be
          // adjacent to further text or another sentinel.
          let searchFrom = 0;
          while (searchFrom < pending.length) {
            SENTINEL.lastIndex = searchFrom;
            const match = SENTINEL.exec(pending);
            if (!match) break;
            committed += pending.slice(searchFrom, match.index);
            lastStatus = match[1] as "researching" | "typing";
            searchFrom = match.index + match[0].length;
          }
          // `committed` now holds everything up to the last consumed sentinel, but
          // may include a trailing text run after the final sentinel that could
          // itself start an incomplete sentinel. Detect a pending "§" boundary:
          const lastSentinelStart = pending.indexOf("§", searchFrom);
          if (lastSentinelStart === -1) {
            // No § beyond our consumed sentinels → commit all remaining text and
            // clear the pending hold.
            committed += pending.slice(searchFrom);
            pending = "";
          } else if (lastSentinelStart === searchFrom) {
            // Remaining bytes start with § but didn't form a complete sentinel →
            // it's a partial sentinel. Hold it back; don't commit.
            pending = pending.slice(lastSentinelStart);
          } else {
            // Some text, THEN a partial sentinel. Commit the text, hold the §… tail.
            committed += pending.slice(searchFrom, lastSentinelStart);
            pending = pending.slice(lastSentinelStart);
          }
          return committed;
        };

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // Flush any remaining bytes held in the decoder's internal buffer.
              // Without this final decode, multi-byte UTF-8 characters split
              // across chunk boundaries (or the last partial chunk) are lost,
              // causing the response to appear truncated.
              const endTail = decoder.decode();
              if (endTail) pending += endTail;
              // At stream end there's no next chunk to complete a sentinel, so any
              // leftover §… is NOT a sentinel (a real sentinel would have closed
              // with a trailing § already consumed above). Strip stray § and commit.
              const finalText = pending.replace(/§STATUS:\w*§?|§/g, "");
              pending = "";
              if (finalText) {
                accumulated += finalText;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, content: accumulated, typingStatus: undefined }
                      : m,
                  ),
                );
              }
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            pending += chunk;
            const committed = commitSafeText(assistantMessage.id);

            if (committed) {
              accumulated += committed;
            }

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? {
                      ...m,
                      content: accumulated,
                      typingStatus: accumulated
                        ? undefined // real text has arrived — hide the indicator
                        : (lastStatus ?? m.typingStatus),
                    }
                  : m,
              ),
            );
          }
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? {
                  ...m,
                  content: `Sorry, something went wrong. ${err instanceof Error ? err.message : "Please try again."}`,
                }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [botPublicId, messages, isLoading],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleQuickReply(reply: string) {
    sendMessage(reply);
  }

  function copyMessage(content: string, id: string) {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}

            <div className="flex flex-col">
              {msg.role === "assistant" && botName && msg.id !== "greeting" && (
                <span className="mb-1 text-xs font-semibold text-foreground/80">
                  {botName}
                </span>
              )}

              <div
                className={`group relative max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
              {msg.role === "assistant" ? (
                // While the response is still streaming and no text has
                // arrived yet, show the animated typing indicator (pill +
                // bouncing dots) instead of an empty / placeholder bubble.
                // Once the first real token lands, `content` is non-empty and
                // we switch to rendering markdown.
                !msg.content && msg.typingStatus ? (
                  <TypingIndicator status={msg.typingStatus} />
                ) : (
                  <div className="prose-chat">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Copy button */}
              {msg.role === "assistant" && msg.content && (
                <button
                  onClick={() => copyMessage(msg.content, msg.id)}
                  className="absolute -right-2 -top-2 hidden rounded-md border bg-background p-1 opacity-0 transition-opacity group-hover:block group-hover:opacity-100"
                >
                  {copiedId === msg.id ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              )}

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 border-t pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Sources:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {msg.citations.map((citation, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md bg-background/50 px-2 py-0.5 text-xs"
                      >
                        {citation.documentName}
                        {citation.heading && ` — ${citation.heading}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {quickReplies.length > 0 && messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {quickReplies.map((reply) => (
            <Button
              key={reply}
              variant="outline"
              size="sm"
              onClick={() => handleQuickReply(reply)}
              disabled={isLoading}
              className="text-xs"
            >
              {reply}
            </Button>
          ))}
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t p-4"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={isLoading}
          className="flex-1"
          autoFocus
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
