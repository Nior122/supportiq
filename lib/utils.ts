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

/** Convert Hex color to HSL space-separated string for CSS variables. */
export function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1]! + hex[1], 16);
    g = parseInt(hex[2]! + hex[2], 16);
    b = parseInt(hex[3]! + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
