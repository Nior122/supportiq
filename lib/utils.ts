/**
 * WHY THIS FILE EXISTS
 * -------------------
 * The `cn` helper merges Tailwind classes with conflict resolution (later wins),
 * using `clsx` for conditionals and `tailwind-merge` to drop shadowed utilities.
 * Every component in the system leans on this — e.g. `cn("px-4", isActive && "px-6")`
 * keeps the final className clean and predictable instead of `px-4 px-6`.
 *
 * Also hosts a few tiny pure utilities reused across the app so they have ONE home
 * (not re-implemented in each module).
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Clamp a number — handy for chat log heights + analytics ranges. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Format an integer with thin separators — `1234567` → `1,234,567`. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(
    Number.isInteger(value) ? value : Math.round(value),
  );
}

/** Compact number for KPI tiles — `12345` → `12.3k`. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Title: a latency in ms → readable "1.2s" / "320ms" for analytics rows. */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/** isEqual-ish for primitives used by client toggles (keeps lodash out of bundle). */
export function isTruthy(v: unknown): boolean {
  return v === true || v === "true" || v === 1 || v === "1";
}
