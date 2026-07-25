/**
 * SupportIQ Typing Indicator - Premium AI Rebrand
 */
"use client";

import { Sparkles } from "lucide-react";

interface TypingIndicatorProps {
  status?: "researching" | "typing";
}

const STATUS_LABEL: Record<NonNullable<TypingIndicatorProps["status"]>, string> = {
  researching: "Researching knowledge base...",
  typing: "Synthesizing response...",
};

export function TypingIndicator({ status = "typing" }: TypingIndicatorProps) {
  const label = STATUS_LABEL[status];

  return (
    <div className="flex flex-col items-start gap-3 py-1">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 shadow-sm animate-pulse">
        <Sparkles className="h-3 w-3 text-primary" />
        <span className="text-[11px] font-black uppercase tracking-[0.1em] text-primary font-mono">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-1.5 px-4">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
