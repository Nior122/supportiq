/**
 * SupportIQ Typing Indicator - Premium AI Blue
 */
"use client";

export function TypingIndicator({ status = "typing" }: { status?: "researching" | "typing" }) {
  const label = status === "researching" ? "AI is searching..." : "AI is thinking...";

  return (
    <div className="flex flex-col items-start gap-2 py-1">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[11px] font-bold uppercase tracking-widest text-primary animate-pulse dark:bg-primary/10 dark:border-primary/20">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {label}
      </div>

      <div className="flex items-center gap-1.5 px-2">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
