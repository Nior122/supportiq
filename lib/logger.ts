/**
 * WHY THIS FILE EXISTS
 * -------------------
 * A tiny structured logger. We don't pull a heavy dep (pino/winston) here because:
 *   1. On Vercel, stdout/stderr is the log — a tagged console line is already
 *      structured enough for the platform's log explorer.
 *   2. Keeping the interface minimal means we can swap to OTLP/Papertrail later
 *      without touching every call site (they all import `logger`).
 *
 * The `scope` string lets every log carry its origin module so triage doesn't
 * require grepping. `error` calls serialize stack traces only server-side (we
 * never want stack traces reaching the browser console in production).
 */

type Level = "debug" | "info" | "warn" | "error";

const isDev = process.env.NODE_ENV !== "production";

function emit(level: Level, scope: string, message: string, meta?: unknown) {
  // Debug is dev-only to keep prod logs high-signal.
  if (level === "debug" && !isDev) return;

  const prefix = `[${scope}]`;
  const tag = level.toUpperCase();
  const payload =
    meta !== undefined
      ? `${prefix} ${tag} ${message} ${safeStringify(meta)}`
      : `${prefix} ${tag} ${message}`;

  // Route to the right console stream so log explorers group by severity.
  switch (level) {
    case "error":
      console.error(payload);
      break;
    case "warn":
      console.warn(payload);
      break;
    default:
      console.info(payload);
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Factory: gives a module its own scoped logger so logs show their origin. */
export function createLogger(scope: string) {
  return {
    debug: (msg: string, meta?: unknown) => emit("debug", scope, msg, meta),
    info: (msg: string, meta?: unknown) => emit("info", scope, msg, meta),
    warn: (msg: string, meta?: unknown) => emit("warn", scope, msg, meta),
    error: (msg: string, meta?: unknown) => emit("error", scope, msg, meta),
  };
}

export const logger = createLogger("app");
