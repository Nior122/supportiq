/**
 * SupportIQ Chat Widget - Premium AI Blue
 */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Copy, Check, Info, SparklesIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { TypingIndicator } from "./typing-indicator";
import { cn } from "@/lib/utils";

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
  className,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>(() => 
    greeting ? [{ id: "greeting", role: "assistant", content: greeting }] : []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        typingStatus: "researching",
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const apiMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ botPublicId, messages: apiMessages }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to send message");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let pending = "";
        let lastStatus: "researching" | "typing" | undefined;
        const SENTINEL = /§STATUS:(researching|typing)§/g;

        const commitSafeText = (): string => {
          let committed = "";
          SENTINEL.lastIndex = 0;
          let searchFrom = 0;
          while (searchFrom < pending.length) {
            SENTINEL.lastIndex = searchFrom;
            const match = SENTINEL.exec(pending);
            if (!match) break;
            committed += pending.slice(searchFrom, match.index);
            lastStatus = match[1] as "researching" | "typing";
            searchFrom = match.index + match[0].length;
          }
          const lastSentinelStart = pending.indexOf("§", searchFrom);
          if (lastSentinelStart === -1) {
            committed += pending.slice(searchFrom);
            pending = "";
          } else {
            committed += pending.slice(searchFrom, lastSentinelStart);
            pending = pending.slice(lastSentinelStart);
          }
          return committed;
        };

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              const endTail = decoder.decode();
              if (endTail) pending += endTail;
              const finalText = pending.replace(/§STATUS:\w*§?|§/g, "");
              if (finalText) accumulated += finalText;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: accumulated, typingStatus: undefined }
                    : m,
                ),
              );
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            pending += chunk;
            const committed = commitSafeText();
            if (committed) accumulated += committed;

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? {
                      ...m,
                      content: accumulated,
                      typingStatus: accumulated ? undefined : (lastStatus ?? m.typingStatus),
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
              ? { ...m, content: `Error: ${err instanceof Error ? err.message : "Request failed."}`, typingStatus: undefined }
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
    <div className={cn("flex h-full flex-col bg-background relative overflow-hidden", className)}>
      {/* Header */}
      <div className="flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-sm relative z-20">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-glow">
          <SparklesIcon className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground leading-none">
            {botName ?? "AI Assistant"}
          </span>
          <span className="mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            Online
          </span>
        </div>
      </div>

      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3 group", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            {/* Avatar */}
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110",
              msg.role === "assistant" ? "bg-primary shadow-glow" : "bg-muted border border-border"
            )}>
              {msg.role === "assistant" ? (
                <SparklesIcon className="h-4 w-4 text-white" />
              ) : (
                <User className="h-4 w-4 text-slate-400" />
              )}
            </div>

            <div className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
              {msg.role === "assistant" && botName && msg.id !== "greeting" && (
                <span className="mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {botName}
                </span>
              )}
              <div
                className={cn(
                  "relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none font-medium"
                    : "bg-muted border border-border text-foreground rounded-tl-none dark:bg-slate-900"
                )}
              >
                {msg.role === "assistant" ? (
                  !msg.content && msg.typingStatus ? (
                    <TypingIndicator status={msg.typingStatus} />
                  ) : (
                    <div className="prose-saas dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                       <Info className="h-3 w-3 text-primary" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((citation, i) => (
                        <span key={i} className="inline-flex items-center rounded-lg bg-primary/5 border border-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {citation.documentName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Copy button */}
                {msg.role === "assistant" && msg.content && (
                  <button
                    onClick={() => copyMessage(msg.content, msg.id)}
                    className="absolute -right-10 top-0 h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-background/50 backdrop-blur-sm opacity-0 transition-all hover:bg-muted group-hover:opacity-100"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {quickReplies.length > 0 && messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-4 relative z-10">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleQuickReply(reply)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t bg-background/80 backdrop-blur-md relative z-10">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1 group">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="h-11 pl-4 pr-12 rounded-xl border-border bg-muted/50 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
            />
            <div className="absolute right-1.5 top-1">
               <Button
                type="submit"
                size="icon-sm"
                disabled={!input.trim() || isLoading}
                className="h-9 w-9 rounded-lg shadow-glow bg-primary hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </form>
        <div className="mt-3 flex items-center justify-center">
           <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">Powered by SupportIQ</span>
        </div>
      </div>
    </div>
  );
}
