/**
 * WHY THIS FILE EXISTS
 * -------------------
 * `lib/env.ts` validates the FULL server env at import time — including secrets like
 * CLERK_SECRET_KEY and STRIPE_SECRET_KEY. Importing THAT file anywhere in the client
 * bundle (e.g. a "use client" provider) would (a) fail Zod on missing server secrets
 * the client never has, and (b) risk bundling secret names into browser JS.
 *
 * This file is the CLIENT-SAFE counterpart: it only exposes `NEXT_PUBLIC_*` values
 * the browser legitimately has access to, with no server-secret validation. Client
 * components import from here; server code imports from `@/lib/env`.
 *
 * We use inline `process.env.NEXT_PUBLIC_X ?? fallback` (no Zod) because Next.js
 * statically inlines NEXT_PUBLIC_* at build time — Zod parsing here would add
 * runtime cost and AOT-inline the literals anyway. The server-side `env.ts` remains
 * the validation source of truth for non-public values.
 */

export const publicEnv = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in",
  CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up",
  CLERK_AFTER_SIGN_IN_URL:
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/dashboard",
  CLERK_AFTER_SIGN_UP_URL:
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ?? "/onboarding",
  STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
} as const;
