import { z } from "zod";

/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Production servers must fail LOUD at boot if required secrets are missing — not
 * silently degrade at the first customer request. We declare every environment
 * dependency in one typed schema and validate it once at import time. Any file that
 * needs an env value imports `env.X` (typed, autocompleted) instead of
 * `process.env.X` (string | undefined, error-prone). This single pattern eliminates
 * an entire class of "works on my machine" deploy bugs.
 *
 * Secrets are partitioned into sections by concern so a reader can audit what the app
 * actually needs from each provider.
 */

const booleanString = z
  .string()
  .transform((v) => v === "true" || v === "1")
  .default("false");

const envSchema = z.object({
  // ─── Runtime ───────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000")
    .describe("Public-facing origin used for absolute URLs + embed script origin."),

  // ─── Database (Neon Postgres + pgvector) ────────────────────
  // Pooling URL for queries; direct URL for Prisma migrations ( Neon splits these).
  DATABASE_URL: z.string().url().describe("Neon pooled connection string."),
  DIRECT_URL: z.string().url().optional().describe("Direct (non-pooled) connection for migrations."),

  // ─── Auth (Clerk) ───────────────────────────────────────────
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional().describe("Svix secret for Clerk user/webhook sync."),

  // Clerk frontend route overrides — kept here so a rebrand to /signin etc. is one line.
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default("/dashboard"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default("/onboarding"),

  // ─── AI providers (any subset may be configured) ───────────
  // The active provider is chosen per-bot in the DB; here we only register the keys
  // the server may use. Each is optional so a single-provider deploy still works.
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  ANTHROPIC_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),

  // ─── Embeddings (Jina) ────────────────────────────────────
  // Jina provides an OpenAI-compatible embeddings endpoint at api.jina.ai.
  // `jina-embeddings-v3` can emit 1536 dims natively, matching the existing
  // pgvector(1536) column — so this works with NO migration. Free tier ~1M
  // tokens/month. Chat stays on Groq; RAG retrieval embeddings come from Jina.
  JINAAI_API_KEY: z.string().optional(),
  JINA_EMBEDDING_MODEL: z.string().default("jina-embeddings-v3"),
  JINA_EMBEDDING_DIMENSIONS: z
    .number()
    .int()
    .min(1)
    .max(8192)
    .default(1536)
    .describe("Output dims for jina-embeddings-v3; 1536 matches the pgvector column."),


  // ─── Storage (Cloudinary OR Vercel Blob) ───────────────────
  // We default to Cloudinary; Blob is supported by checking CLOUDINARY_CLOUD_NAME first.
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  BLOB_READ_URL_TOKEN: z.string().optional().describe("Vercel Blob RW token (alt storage backend)."),

  // ─── Payments (Stripe — prepared, may be disabled) ────────
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_ENABLED: booleanString.describe("Master switch for billing features."),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_GROWTH: z.string().optional(),
  STRIPE_PRICE_SCALE: z.string().optional(),

  // ─── Rate limiting (Upstash Redis) ──────────────────────────
  // Optional: if absent we fall back to an in-memory limiter in dev. Upstash is the
  // serverless-safe choice because it speaks HTTP (no long-lived TCP pools).
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ─── Embedded widget ───────────────────────────────────────
  // The embed script is served from the app itself under /embed; this secret signs
  // the widget config token so customers can't tamper with CORS-restricted payloads.
  EMBED_SIGNING_SECRET: z.string().min(32).optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Format the missing/invalid keys in a way that's immediately actionable in a
    // deploy log — list each key + its issue, not a giant Zod tree.
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `❌ Invalid environment variables. Fix the following before starting the app:\n${issues}`,
    );
  }
  return parsed.data;
}

export const env = loadEnv();

/** Whether Stripe billing is actually wired up (key present AND enabled). */
export const isStripeEnabled = Boolean(
  env.STRIPE_ENABLED &&
    env.STRIPE_SECRET_KEY &&
    env.STRIPE_WEBHOOK_SECRET,
);

/** Which AI chat providers have credentials configured and are therefore selectable. */
export const availableChatProviders = {
  openai: Boolean(env.OPENAI_API_KEY),
  anthropic: Boolean(env.ANTHROPIC_API_KEY),
  groq: Boolean(env.GROQ_API_KEY),
} as const;

/**
 * Which embedding provider is configured for RAG. Jina is the default; OpenAI is a
 * fallback if both keys exist (Jina wins because it's free-tier and matches the
 * existing 1536-dim column without a migration). Retrieval silently degrades to
 * "no context" in the chat route when this is false — surfaced as a clear error
 * at upload time instead.
 */
export const availableEmbeddingProvider = env.JINAAI_API_KEY
  ? "jina"
  : env.OPENAI_API_KEY
    ? "openai"
    : null;

/** Whether remote (Upstash) rate limiting is configured. */
export const hasRemoteRateLimit = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN,
);

export type Env = z.infer<typeof envSchema>;
