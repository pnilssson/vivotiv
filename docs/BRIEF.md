# Vivotiv -- Build Brief

## What is Vivotiv?

A platform that takes existing websites (typically WordPress), scans them, rebuilds them as modern Next.js apps, and provides ongoing AI-powered editing. Long-term: full web presence management (SEO, WCAG compliance, analytics, monitoring).

## What to build FIRST

The **Vivotiv landing page + Free Website Scan**. This is a standalone lead generation tool that ships before the full migration platform.

### Landing page requirements

- Single-page marketing site for vivotiv.com
- Hero: URL input field prominently centered. "Paste your website URL. See what's holding it back."
- Brief explanation of what the scan checks (6 categories)
- How it works: 3 steps (paste URL, enter email, get results)
- Email capture gate: user must enter email before seeing full scan results
- CTA focused on the free scan, NOT the full product (that doesn't exist yet)
- Swedish as default on vivotiv.se, English as default on vivotiv.com
- Clean, modern, professional design. Think Linear/Vercel aesthetic.
- Mobile-first responsive

### Tech stack (non-negotiable)

- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **i18n:** next-intl (App Router native, Server Components support)
- **Forms:** TanStack Form + Zod validation
- **URL state:** nuqs (type-safe URL search parameter management)
- **Animations:** Motion (formerly Framer Motion)
- **Monorepo:** Turborepo + pnpm workspaces
- **Deployment:** Vercel

### Monorepo structure

```
vivotiv/
  apps/
    web/           # Next.js landing page + scan UI
    api/           # Hono API (scan pipeline, form handling)
  packages/
    db/            # Drizzle schemas + migrations
    shared/        # Zod schemas, TypeScript types, constants
  turbo.json
  pnpm-workspace.yaml
```

### Domain strategy

- `vivotiv.com` -- primary domain, defaults to English
- `vivotiv.se` -- same app, same Vercel project, defaults to Swedish
- next-intl middleware detects domain and sets locale
- Future languages as path segments on .com (e.g. `/no`, `/da`)

### What NOT to build yet

- User authentication / dashboard
- Payment / billing
- The full migration platform
- Blog / content pages

### Phase 1 deliverable

A beautiful landing page that:
1. Explains what the scan does (6 categories: Performance, SEO, Accessibility, EU Legal Compliance, Security, Modern Web Standards)
2. Has a URL input + email capture form
4. Stores the lead (email + URL) in Supabase
5. Sends a confirmation email via Nodemailer (one.com SMTP)
6. Works in both Swedish and English via next-intl
