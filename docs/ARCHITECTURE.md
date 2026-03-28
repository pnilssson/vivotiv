# Vivotiv -- Architecture & Tech Decisions

## Product Overview

Vivotiv automates the full lifecycle of taking an existing website (e.g. WordPress) and turning it into a modern, hosted, AI-editable Next.js codebase -- with ongoing editing via natural language prompts and a Git-based approval flow.

## Domain Strategy

- `vivotiv.com` -- primary domain, defaults to English
- `vivotiv.se` -- same Next.js app on same Vercel project, defaults to Swedish
- Both served from the same codebase. next-intl middleware detects domain and sets default locale.
- Future languages as path segments on .com (e.g. vivotiv.com/no for Norwegian)

## Monorepo Structure

Turborepo + pnpm workspaces.

```
vivotiv/
  apps/
    web/           # Next.js SaaS UI -> deploys as Vercel project
    api/           # Hono pipeline API -> deploys as separate Vercel project
  packages/
    db/            # Drizzle schemas + migrations + RLS policies
    shared/        # Zod schemas, TypeScript types, constants
    template/      # Base Next.js template for generated customer sites (later)
  turbo.json
  pnpm-workspace.yaml
```

Both apps deploy to Vercel from the same repo, each as its own project. Turborepo handles the build graph so packages/db builds before both apps.

## Tech Stack

### Core Product

| Layer | Technology | Rationale |
|---|---|---|
| Frontend (SaaS UI) | Next.js + Tailwind + shadcn/ui + next-intl + Zod + TanStack React Query + TanStack Form + nuqs + Motion | Dogfood own stack. next-intl for i18n from day one. nuqs for type-safe URL search params (filters, pagination, shareable scan results). |
| Backend / Pipeline API | Hono | Lightweight, edge-deployable. Next.js API routes for simple SaaS endpoints only. |
| Database + Auth | Supabase (Postgres + Auth + Storage) + Drizzle ORM | Schema-as-code, migrations, RLS via pgPolicy(). |
| Background jobs | Inngest | Event-driven, managed, no Redis. |
| AI | Anthropic Claude (primary) + OpenAI (fallback) | Direct API, no OpenRouter markup. |
| AI orchestration | Vercel AI SDK | Lightweight, TypeScript-native, streaming, structured output. |
| Monorepo | Turborepo + pnpm workspaces | Shared packages between apps. |

### Supporting Infrastructure

| Purpose | Tool |
|---|---|
| Auth | Supabase Auth |
| Payments | Polar.sh |
| Error monitoring | Sentry |
| Analytics | PostHog |
| Transactional email | Nodemailer (MVP) via one.com SMTP. Transition to Resend later. |


## Build Order (MVP)

1. Free Website Scan + landing page (see FREE-WEBSITE-SCAN.md)
2. Scraper + design analysis pipeline
3. Static Next.js generator
4. Manual review UI
5. GitHub + Vercel automation
6. Domain connection wizard
7. Prompt-based editing + PR flow
8. Billing + onboarding

Start with step 1 to capture leads and validate demand while building steps 2-3.
