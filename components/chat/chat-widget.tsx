/**
 * SupportIQ Chat Widget - Premium AI Rebrand
 */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, User, Copy, Check, Info } from "lucide-react";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (greeting && messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content: greeting,
        },
      ]);
    }
  }, [greeting, messages.length]);

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
          body: JSON.stringify({
            botPublicId,
            messages: apiMessages,
          }),
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

  return (
    <div className={cn("flex h-full flex-col bg-background relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4 group animate-fade-in",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-glow transition-transform group-hover:scale-110",
              msg.role === "assistant" ? "bg-ai-gradient" : "bg-muted"
            )}>
              {msg.role === "assistant" ? (
                <Sparkles className="h-5 w-5 text-white" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === "user" ? "items-end" : "items-start"
            )}>
              {msg.role === "assistant" && botName && (
                <span className="mb-2 text-[10px] font-black uppercase tracking-widest text-primary/60 font-mono">
                  {botName} — AI_NODE
                </span>
              )}

              <div
                className={cn(
                  "relative rounded-3xl px-6 py-4 text-[15px] leading-relaxed shadow-sm transition-all",
                  msg.role === "user"
                    ? "bg-ai-gradient text-white rounded-tr-none font-medium"
                    : "bg-[#FAF5FF] border border-[#DDD6FE] text-foreground rounded-tl-none dark:bg-[#17112F] dark:border-white/10 dark:text-[#F9FAFB]"
                )}
              >
                {msg.role === "assistant" ? (
                  !msg.content && msg.typingStatus ? (
                    <TypingIndicator status={msg.typingStatus} />
                  ) : (
                    <div className="prose-chat dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                       <Info className="h-3 w-3 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 font-mono">Source_Verified</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((citation, i) => (
                        <span key={i} className="inline-flex items-center rounded-lg bg-primary/5 border border-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                          {citation.documentName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {msg.role === "assistant" && msg.content && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                      setCopiedId(msg.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="absolute -right-12 top-0 h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-background/50 backdrop-blur-sm opacity-0 transition-all hover:bg-primary hover:text-white group-hover:opacity-100"
                  >
                    {copiedId === msg.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-6 border-t border-white/5 bg-background/50 backdrop-blur-md relative z-10">
        {quickReplies.length > 0 && messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4 animate-slide-up">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                disabled={isLoading}
                className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="relative flex items-center gap-3"
        >
          <div className="relative flex-1 group">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI anything..."
              disabled={isLoading}
              className="h-14 pl-6 pr-16 rounded-2xl border-white/10 bg-white/5 focus:ring-primary/20 focus:border-primary/50 transition-all text-base"
            />
            <div className="absolute right-3 top-2.5">
               <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-9 w-9 rounded-xl shadow-glow"
                variant="gradient"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
        <div className="mt-4 flex items-center justify-center gap-2">
           <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest opacity-50">Powered by SupportIQ Neural_Core_v2</span>
        </div>
      </div>
    </div>
  );
}
