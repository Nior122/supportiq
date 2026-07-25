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
  greeting,
  className,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (greeting && messages.length === 0) {
      setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
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

  return (
    <div className={cn("flex h-full flex-col bg-slate-50 dark:bg-slate-950/50", className)}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-4 group", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            {/* Avatar */}
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm",
              msg.role === "assistant" ? "bg-ai-gradient-primary shadow-glow ring-2 ring-blue-500/20" : "bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
            )}>
              {msg.role === "assistant" ? (
                <SparklesIcon className="h-5 w-5 text-white" />
              ) : (
                <User className="h-5 w-5 text-slate-400" />
              )}
            </div>

            <div className={cn("flex flex-col max-w-[80%]", msg.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "relative rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-all",
                  msg.role === "user"
                    ? "bg-[#2563EB] text-white rounded-tr-none font-medium"
                    : "bg-white border border-[#BFDBFE] text-slate-900 rounded-tl-none dark:bg-[#0F172A] dark:border-slate-800 dark:text-slate-100"
                )}
              >
                {msg.role === "assistant" ? (
                  !msg.content && msg.typingStatus ? (
                    <TypingIndicator status={msg.typingStatus} />
                  ) : (
                    <div className="prose-saas">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                       <Info className="h-3 w-3 text-blue-500" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((citation, i) => (
                        <span key={i} className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-400">
                          {citation.documentName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-6 border-t border-slate-200 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="relative flex items-center gap-3"
        >
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI anything..."
              disabled={isLoading}
              className="h-12 pl-6 pr-14 rounded-xl border-slate-200 bg-slate-100/50 dark:bg-slate-900/50 dark:border-slate-800"
            />
            <div className="absolute right-2 top-1.5">
               <Button
                type="submit"
                size="icon-sm"
                disabled={!input.trim() || isLoading}
                className="rounded-lg shadow-glow"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
