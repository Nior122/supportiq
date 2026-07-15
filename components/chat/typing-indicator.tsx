/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Typing indicator shown inside an empty assistant bubble while the bot is
 * working — before any text token has streamed. Two visual states, driven by
 * the inband `§STATUS:researching§` / `§STATUS:typing§` sentinels the chat
 * route emits:
 *
 *   - "researching" → pill reads "Searching knowledge base…" (covers the RAG
 *     retrieval + model-warmup latency before the first token).
 *   - "typing"     → pill reads "Thinking…" (set right before token 0).
 *
 * Below the pill sit three bouncing dots — the universal "someone is typing"
 * cue — staggered with inline animation delays so they don't move in lockstep.
 * Uses Tailwind's built-in `animate-bounce` + `tailwindcss-animate`, so no
 * custom keyframe is required in tailwind.config.ts.
 *
 * The indicator disappears the moment real text starts populating the bubble
 * (the caller only renders it while the assistant message content is empty).
 */
"use client";

interface TypingIndicatorProps {
  /**
   * Which status pill to show. Defaults to "typing" so a caller that doesn't
   * track sentinels still gets a reasonable "Thinking…" label.
   */
  status?: "researching" | "typing";
}

const STATUS_LABEL: Record<NonNullable<TypingIndicatorProps["status"]>, string> = {
  researching: "Searching knowledge base…",
  typing: "Thinking…",
};

export function TypingIndicator({ status = "typing" }: TypingIndicatorProps) {
  const label = STATUS_LABEL[status];

  return (
    <div className="flex flex-col items-start gap-1.5 py-0.5">
      {/* Status pill — semantically colored: brand for research, muted for thinking */}
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        <span
          className="h-1.5 w-1.5 rounded-full bg-primary"
          // Subtle pulse so the pill reads as "actively working", not a static label.
          // tailwindcss-animate provides animate-pulse; this is intentionally gentle.
        />
        {label}
      </span>

      {/* Three bouncing dots, staggered so they ripple left-to-right */}
      <div className="flex items-center gap-1 px-1">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
