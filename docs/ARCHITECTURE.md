# Vivotiv -- Architecture

## What is Vivotiv?

A platform that takes existing websites (typically WordPress), scans them, rebuilds them as modern Next.js apps, and provides ongoing AI-powered editing. Long-term: full web presence management (SEO, WCAG compliance, analytics, monitoring).

## What to build FIRST

The **Vivotiv landing page + Free Website Scan**. A standalone lead generation tool that ships before the full migration platform. Captures leads, validates demand, and naturally leads to the full product.

## Domain Strategy

- `vivotiv.com` -- primary domain, defaults to English
- Swedish content is served from `vivotiv.com/sv`
- Both locales are served from the same codebase. next-intl uses path-based locale routing.
- Future languages as path segments on .com (e.g. vivotiv.com/no for Norwegian)

## Monorepo Structure

Turborepo + pnpm workspaces.

```
vivotiv/
  apps/
    web/           # Next.js SaaS UI -> Vercel
    api/           # Hono API -> Cloudflare Workers
    jobs/          # Background jobs (scan pipeline) -> Railway (Docker)
  packages/
    db/            # Drizzle schemas + migrations + RLS policies
    shared/        # Zod schemas, TypeScript types, constants
  docs/            # Architecture, scan pipeline, specs
  turbo.json
  pnpm-workspace.yaml
```

## Tech Stack

### Core Product

| Layer | Technology | Rationale |
|---|---|---|
| Frontend (SaaS UI) | Next.js + Tailwind + shadcn/ui + next-intl + Zod + TanStack React Query + TanStack Form + nuqs + Motion | Dogfood own stack. next-intl for i18n from day one. nuqs for type-safe URL search params. |
| API | Hono on Cloudflare Workers | Lightweight, edge-deployable. Handles scan submissions, form handling. |
| Background jobs | Hono + Inngest on Railway (Docker) | Event-driven scan pipeline. Runs Lighthouse + Playwright in Docker with Chromium. |
| Database + Auth | Supabase (Postgres + Auth + Storage) + Drizzle ORM | Schema-as-code, migrations, RLS via pgPolicy(). |
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

### Deployment

| App | Platform | Trigger |
|---|---|---|
| web | Vercel | Push to main (Vercel Git integration) |
| api | Cloudflare Workers | GitHub Actions (`deploy-api.yml`), also runs Drizzle migrations |
| jobs | Railway (Docker) | GitHub Actions (`deploy-jobs.yml`), builds Docker image via GHCR |

## Build Order (MVP)

1. Free Website Scan + landing page (see FREE-WEBSITE-SCAN.md)
2. Scraper + design analysis pipeline
3. Static Next.js generator
4. Manual review UI
5. GitHub + Vercel automation
6. Domain connection wizard
7. Prompt-based editing + PR flow
8. Billing + onboarding
