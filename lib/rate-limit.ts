/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Rate limiting utility. Uses Upstash Redis when configured, falls back to
 * an in-memory sliding window for development. This prevents abuse of:
 *  - Chat API (per-bot)
 *  - Embed token generation (per-workspace)
 *  - File uploads (per-workspace)
 *  - General API (per-IP)
 *
 * Rate limiters are keyed by a string (IP, user ID, bot ID, etc.) and return
 * `{ allowed: boolean, remaining: number, reset: number }`.
 */
import { env, hasRemoteRateLimit } from "./env";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Unix timestamp in ms
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

// ─── In-memory sliding window (dev fallback) ─────────────────────
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.max - 1,
      reset: now + config.windowMs,
    };
  }

  if (entry.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.max - entry.count,
    reset: entry.resetAt,
  };
}

// ─── Upstash Redis rate limiter (production) ────────────────────
async function upstashRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const redisUrl = env.UPSTASH_REDIS_REST_URL!;
  const redisToken = env.UPSTASH_REDIS_REST_TOKEN!;

  const now = Date.now();
  const windowStart = now - config.windowMs;
  const redisKey = `ratelimit:${key}`;

  try {
    // Sliding-window rate limit using a Redis sorted set (ZSET):
    //   member = unique request id, score = timestamp.
    // Atomicity: the /pipeline endpoint runs all commands as one batch.
    // Upstash REST pipeline expects an array of [command, ...args] arrays.
    const requestId = `${now}-${Math.random().toString(36).slice(2)}`;
    const pipeline = [
      // 1. Drop entries older than the window
      ["ZREMRANGEBYSCORE", redisKey, "-inf", String(windowStart)],
      // 2. Record this request with its timestamp as the score
      ["ZADD", redisKey, String(now), requestId],
      // 3. Count requests currently in the window
      ["ZCARD", redisKey],
      // 4. Expire the key so stale buckets don't accumulate
      ["PEXPIRE", redisKey, String(config.windowMs)],
    ];

    const response = await fetch(redisUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    if (!response.ok) {
      // If Redis is down, allow the request (fail open — availability over strictness)
      return {
        allowed: true,
        remaining: config.max,
        reset: now + config.windowMs,
      };
    }

    const results = (await response.json()) as Array<{ result?: number }>;
    const count = results[2]?.result ?? 1;

    return {
      allowed: count <= config.max,
      remaining: Math.max(0, config.max - count),
      reset: now + config.windowMs,
    };
  } catch {
    // If Redis is unreachable, allow the request (fail open)
    return {
      allowed: true,
      remaining: config.max,
      reset: now + config.windowMs,
    };
  }
}

// ─── Main export ────────────────────────────────────────────────
export async function rateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  if (hasRemoteRateLimit) {
    return upstashRateLimit(key, config);
  }
  return memoryRateLimit(key, config);
}

// ─── Predefined rate limit configs ──────────────────────────────
export const rateLimitConfigs = {
  /** Chat API: 30 requests per minute per bot */
  chat: { windowMs: 60_000, max: 30 },
  /** Embed token: 10 requests per minute per workspace */
  embed: { windowMs: 60_000, max: 10 },
  /** File upload: 5 requests per minute per workspace */
  upload: { windowMs: 60_000, max: 5 },
  /** General API: 60 requests per minute per IP */
  api: { windowMs: 60_000, max: 60 },
} as const;
