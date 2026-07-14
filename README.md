# SupportIQ

**AI-powered customer support chatbot SaaS.** Businesses train an AI assistant on their own content (PDFs, websites, text, FAQs), embed it on their site with one line of script, and analyze every conversation.

> Production-grade architecture modeled after Chatbase, Intercom Fin, and Tidio AI.

---

## Tech stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | Server Components, streaming, edge-ready |
| Language | TypeScript (strict) | Type safety end to end |
| Styling | Tailwind CSS + shadcn/ui + Framer Motion | Premium SaaS UI, dark mode, animation |
| Auth | Clerk |托管 auth, webhooks, org/multi-tenant ready |
| Database | PostgreSQL (Neon) + Prisma | Serverless Postgres with free autoscaling |
| Vector search | pgvector | Embeddings live with relational data — one query |
| AI models | OpenAI / Anthropic / Groq (configurable) | Vendor lock-in avoided by provider abstraction |
| Storage | Cloudinary (primary) / Vercel Blob | Media + uploads |
| Payments | Stripe (prepared) | Billing architecture ready to flip on |
| Rate limiting | Upstash Redis | Serverless-safe HTTP rate limits |
| Deploy | Vercel | First-class Next.js hosting |

## Architecture (clean separation)

```
app/          Route segments (pages + route handlers) — thin, no business logic
actions/      Server Actions — the mutation surface between server & client
services/     Domain business logic + external providers (AI, storage, stripe)
lib/          Cross-cutting infra: db client, env, auth helpers, logger
hooks/        Client-side React hooks (data fetching, UI state)
components/   Reusable UI (shadcn primitives + composed app components)
types/        Shared TypeScript types / Zod schemas
utils/        Pure functions (formatting, csv, id-gen, crypto)
api/          REST-style route handlers (CORS for embed, webhooks)
middleware/   Next middleware (Clerk route protection, rate-limit gate)
prisma/       Schema, migrations, seed
public/       Static assets served as-is
```

### Layering rule

`app/ → actions/ & api/ → services/ → lib/ & utils/`

UI layers never touch Prisma or external providers directly. Business logic lives in `services/` and is invoked exclusively through server actions or route handlers. This keeps every side-effect auditable and individually testable.

## Getting started

```bash
cp .env.example .env     # then fill in Clerk + DB + at least one AI provider
npm install
npm run prisma:migrate   # creates schema on Neon + enables pgvector
npm run prisma:seed      # optional seed data
npm run dev
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` CI gate |
| `npm run lint` | Next ESLint |
| `npm run test` | Vitest unit/integration |
| `npm run test:e2e` | Playwright |
| `npm run prisma:migrate` | Apply migrations |
| `npm run prisma:seed` | Load demo workspace |

## Project status

Being built phase by phase — see `plan.md` / commit history. The repo is structured
so each phase is independently reviewable.
