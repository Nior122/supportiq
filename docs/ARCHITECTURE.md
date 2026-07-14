# SupportIQ — Architecture

This document is the **layering contract**. Every file added in any phase must respect
these rules. Breaking the layering rules reintroduces the spaghetti that clean
architecture exists to prevent.

## Directory → responsibility

```
app/                      Next.js App Router. Pages + route handlers only. NO business logic.
  (landing)/              Marketing site group — own layout, no auth.
  (auth)/                 Clerk-hosted auth flows + onboarding.
  (dashboard)/            Authenticated app. Owns the sidebar/topnav shell.
  playground/[botId]/     Internal playground to test a bot before embedding.
  embed/[publicId]/       Public, iframe-loadable chat widget route.
  api/                    Route handlers (webhooks, ingest, embed config, chat stream).
components/
  ui/                     shadcn primitives (Button, Card, Dialog, …). Zero app semantics.
  landing/                Marketing sections (Hero, Features, Pricing, FAQ).
  dashboard/              Dashboard shell + feature surfaces (Sidebar, Topnav, BotsTable).
  chat/                   Chat UI shared by playground + embed widget.
  embed/                  Public widget-only components (no dashboard deps).
  providers/              App-wide context providers (theme, query, toasts).
  shared/                 Cross-cutting presentational bits (EmptyState, PageHeader).
lib/                      Cross-cutting infra — db client, env, logger, auth金斯, security.
  auth/                   Clerk → workspace resolution + rbac helpers.
  security/               Rate limiters, input sanitizers, csrf, signing.
  validation/             Reusable Zod schemas (pagination, ids) shared by actions/api.
actions/                  Server Actions — the only mutation surface for dashboard forms.
                          Thin: validate → call service → return typed result.
services/                 Domain business logic + external provider integrations.
  ai/                     Provider abstraction (OpenAI/Anthropic/Groq), embeddings, RAG.
  storage/                Cloudinary/Blob upload abstraction.
  embed/                  Widget config signing + serving.
  billing/                Stripe plans, subscriptions, entitlements.
hooks/                    Client-only React hooks (useDebounce, useMediaQuery, useBot).
types/                    Shared TS types + Zod-inferred shapes imported across layers.
utils/                    Pure functions with zero deps (csv, formatting, id-gen, crypto).
api/                      Versioned public REST API route handlers (customers' tools).
middleware/               Next middleware (route protection + rate-limit gate) + helpers.
prisma/                   schema.prisma, migrations, seed.
public/                   Static assets (favicons, og images, embed loader).
tests/                    unit | integration | e2e (Playwright) test suites.
docs/                     ADRs + runbooks.
```

## Dependency rules (enforced by convention + review)

```
app ──▶ actions, api ──▶ services ──▶ lib, utils
  │           │
  └───────────┴──▶ components, hooks, types
```

1. `app/`, `components/`, `hooks/` MUST NOT import from `services/` or call `prisma`
   directly. They go through `actions/` (Server Actions) or `api/` (REST).
2. `actions/` and `api/` are the **only** entry points that touch `services/`.
   This makes every side effect auditable from two directories.
3. `services/` imports `lib/` and `utils/` only — never `app/`, `components/`, or
   Next APIs (`next/headers`, cookies). Services are transport-agnostic so they can
   be tested without spinning up Next.
4. `utils/` is pure: zero imports from anywhere except `lib/` leaf utilities.
5. `types/` defines contracts shared horizontally; nothing imports `types/` from a
   lower layer — types flow down, not up.

## The embedding boundary (security)

The embed widget (`/embed/[publicId]` + `components/embed/`) is loaded in third-party
iframes. It has **no auth cookies**, reads config from a signed token in the path,
and talks ONLY to `app/api/embed/*` endpoints. Those endpoints validate the token
and apply per-widget rate limits. This isolation is what lets us safely tell
customers to paste the script on any site — the widget can never reach their dashboard
session.

## Provider abstraction

`services/ai/` exposes a single `chat()` + `embed()` interface. The active provider
(OpenAI/Anthropic/Groq) is chosen from each bot's `modelProvider` + `modelId` columns.
Adding a provider = one new file in `services/ai/providers/` and a DB enum bump — no
call site changes. This is the whole point of the abstraction: vendor lock-in avoided.
