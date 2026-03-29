# Free Website Scan

Pre-launch lead magnet and sales tool. Scans any URL for performance, SEO, accessibility, EU legal compliance, security, and modern web standards. Shows a traffic-light scorecard that makes the case for a rebuild.

## User Flow

```
Visitor lands on landing page
  -> Pastes their website URL
    -> Enters email to see results (gate)
      -> API upserts lead, fires Inngest event
        -> Scan runs (~15-20s, 3 parallel tracks)
          -> Results page: 6 categories, traffic-light scores
            -> CTA: "We fix all of this. Get your modern site."
```

## Scoring System

Each category gets a 0-100 score. Traffic light:
- Red (0-40): Critical issues
- Orange (41-70): Room for improvement
- Green (71-100): Good shape

Overall score is a weighted average:

| Category | Weight |
|---|---|
| Performance & Speed | 20% |
| SEO | 20% |
| Accessibility (WCAG) | 20% |
| EU Legal Compliance | 20% |
| Security | 10% |
| Modern Web Standards | 10% |

## Jobs App (`apps/jobs`)

Hono + Inngest on Railway in a Docker container. Runs the scan pipeline as background jobs.

### Entry point and routing

- `src/app.ts` -- Hono app with `@hono/node-server`
- `GET /health` -- health check
- `/api/inngest` -- Inngest serve handler
- Inngest client ID: `"vivotiv"`, event: `"scan.requested"` with `{ leadId, url }`

### Database

Supabase transaction pooler (port 6543). Migrations handled by `deploy-api.yml` only -- jobs does not run migrations.

### Docker

- Build stages: `node:22-slim` (base + deps + build), production stage also `node:22-slim`
- Chromium installed via `npx playwright install --with-deps chromium` (no Firefox/WebKit)
- `CHROME_PATH` symlinked for chrome-launcher (Lighthouse)
- `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` for Playwright
- `pnpm deploy --prod --legacy` for minimal node_modules
- `tsup` bundles app with `noExternal: ["@vivotiv/db", "@vivotiv/shared"]`

### Dependencies

- `lighthouse` + `chrome-launcher` -- Lighthouse Node API
- `playwright` + `@axe-core/playwright` -- DOM inspection + WCAG analysis
- `inngest` + `@inngest/middleware-sentry` -- job orchestration + error capture
- `hono` + `@hono/node-server` -- HTTP server

## Scan Pipeline Architecture

Three parallel data collection tracks, then aggregate and store:

```
scan.requested event (Inngest, 2 retries)
  |
  |-- step: "run-lighthouse"       ONE Lighthouse run, all categories
  |     -> performance, seo, security (best-practices)
  |
  |-- step: "run-dom-checks"       ONE Playwright page load, all DOM inspections
  |     -> seo extras, accessibility (axe-core), legal, standards
  |
  |-- step: "run-header-checks"    Plain HTTP fetch, no browser
  |     -> SSL, security headers, server exposure
  |
  (all three run in parallel via Promise.all)
  |
  -> step: "aggregate"             Merge results from all 3 tracks into 6 categories
  -> step: "store"                 Write scan row to Supabase
```

### Why parallel tracks

- **Lighthouse** runs all its categories in a single pass. One run with `onlyCategories: ['performance', 'seo', 'best-practices']`.
- **Playwright DOM checks** share one page load. All extractors run in parallel via `Promise.all` on the same page.
- **Header checks** need no browser. Plain `fetch()` with 15s timeout.

### How tracks map to categories

| Category | Lighthouse | DOM checks | Header checks |
|---|---|---|---|
| Performance | Core Web Vitals, page weight, Speed Index | -- | -- |
| SEO | Meta tags, viewport, Lighthouse SEO score | Structured data, Open Graph, sitemap, robots.txt | -- |
| Accessibility | -- | axe-core WCAG 2.1 AA (full) | -- |
| EU Legal | -- | Cookie banner, reject button, privacy policy, contact info, pre-consent tracking | SSL certificate |
| Security | Mixed content (best-practices) | -- | Security headers, HSTS, server version, HTTPS |
| Modern Standards | -- | Deprecated HTML, responsive check, favicon, third-party scripts | -- |

## Scan Categories

### Performance & Speed

**Source:** Lighthouse `"performance"` category.

Core Web Vitals (LCP, TBT, CLS), FCP, TTFB, Speed Index, page weight, image optimization, render-blocking resources, HTTP/2. Lighthouse assigns scores and weights. Audits split into metrics (scored), opportunities (savings-based), diagnostics (informational). Lighthouse's own category score used directly.

### SEO

**Source:** Lighthouse `"seo"` category + Playwright DOM checks.

Lighthouse: meta title, meta description, viewport, canonical, hreflang, image alt, crawlable anchors, robots directives. `is-crawlable` has ~31% weight (blocks indexing = fails category). All SEO audits are binary pass/fail.

DOM extras (diagnostics, don't affect score): robots.txt validation, sitemap.xml validation, structured data (JSON-LD), Open Graph tags (og:title, og:description, og:image).

Lighthouse's SEO category score used directly.

### Accessibility (WCAG 2.1 AA)

**Source:** axe-core via `@axe-core/playwright` (exclusively, no Lighthouse).

Lighthouse uses axe-core under the hood -- running axe-core directly gives broader WCAG 2.1 AA coverage without duplicates. Filtered with `.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])`.

Impact maps to weight: critical = 3, serious = 2, moderate = 1, minor = 1. Violations = fail, incomplete = warn, passes = pass. All checks are metrics (all affect score). Score calculated by `buildCategoryResult` from weighted metrics.

> EU context: The European Accessibility Act (EAA) became enforceable on June 28, 2025. All businesses with 10+ employees or 2M+ EUR turnover offering digital services to EU customers must comply with WCAG 2.1 AA (via EN 301 549). Fines up to 3 million EUR. Swedish enforcement by DIGG.

### EU Legal Compliance

**Source:** Playwright DOM checks + header checks (SSL).

| Check | What | Weight |
|---|---|---|
| Cookie consent banner | Known selectors (CookieBot, OneTrust, generic) + text fallback (Swedish + English) | 3 |
| Reject option | Known reject/decline selectors + text patterns | 2 |
| Pre-consent tracking | Script tags matching GA, Meta Pixel, Hotjar, Clarity loaded before consent | 3 |
| Privacy policy | Links containing privacy/integritet/personuppgift/dataskydd | 2 |
| Cookie policy | Links containing cookie-policy/kakor/kakpolicy | 1 |
| Contact information | Swedish org numbers (XXXXXX-XXXX), postal codes, street names | 1 |
| SSL certificate | HTTPS status from header checks | 2 |

All checks go into metrics (compliant or not).

### Security

**Source:** Lighthouse `"best-practices"` category + header checks.

Lighthouse: mixed content, deprecated APIs, vulnerable libraries.

Header checks:

| Check | Pass | Fail/Warn | Weight |
|---|---|---|---|
| Content-Security-Policy | Present | Missing = fail | 2 |
| Strict-Transport-Security | max-age >= 31536000 | Low max-age = warn, missing = fail | 2 |
| X-Frame-Options | Present | Missing = warn | 1 |
| X-Content-Type-Options | `nosniff` | Other/missing = warn | 1 |
| Referrer-Policy | Present | Missing = warn | 1 |
| Permissions-Policy | Present | Missing = warn | 1 |
| Server version exposure | No version | Version exposed = warn | 1 |

Lighthouse category score used when available.

### Modern Web Standards

**Source:** Playwright DOM checks (exclusively).

| Check | Pass | Warn | Fail | Weight |
|---|---|---|---|---|
| Responsive design | viewport with `width=device-width` | viewport without `width=device-width` | No viewport meta | 3 |
| Deprecated HTML | None found | -- | `<font>`, `<center>`, `<marquee>`, `<blink>`, `<big>`, `<strike>`, layout tables | 2 |
| Favicon | `<link rel="icon">` or `/favicon.ico` | No favicon | -- | 1 |
| Third-party scripts | 0-10 origins | 11-20 origins | 20+ origins | 2 |

## Data Schema

### CheckResult (one check)

```typescript
{
  id: string               // e.g., "lcp", "meta-title", "color-contrast"
  name: string             // Human-readable name
  status: "pass" | "warn" | "fail" | "error"
  score: number | null     // 0-100
  value: string | null     // Measured value: "4.2s", "Missing"
  rawValue: number | null  // Original measurement
  rawUnit: string | null   // "millisecond", "byte", "element"
  scoreThresholds: { good: string, warn: string } | null
  weight: 1 | 2 | 3       // Importance in scoring
  description: string      // What this measures
  items: string[] | null   // Up to 10 problematic URLs/elements
}
```

### CategoryResult (one of 6 categories)

```typescript
{
  score: number            // 0-100
  status: "pass" | "warn" | "fail" | "error"
  metrics: CheckResult[]        // Scored checks (affect category score)
  opportunities: CheckResult[]  // Optimization suggestions
  diagnostics: CheckResult[]    // Informational checks
}
```

### ScanDetailsV1 (full scan, stored as JSONB)

```typescript
{
  version: 1
  url: string              // Final URL after redirects
  scannedAt: string        // ISO timestamp
  performance: CategoryResult | null
  seo: CategoryResult | null
  accessibility: CategoryResult | null
  legal: CategoryResult | null
  security: CategoryResult | null
  standards: CategoryResult | null
}
```

All schemas defined as Zod in `packages/shared/src/scan/results.ts`. Categories are nullable so the frontend renders whatever is present.

### Database tables

```
leads: id, email (unique), created_at
scans: id, lead_id (FK), url, overall_score, performance_score, seo_score,
       accessibility_score, legal_score, security_score, standards_score,
       details (JSONB: ScanDetailsV1), created_at
```

Lead upsert on email (onConflictDoNothing + fallback select).

## File Structure

```
apps/jobs/src/
  app.ts                              # Hono app + @hono/node-server
  env.ts                              # Environment variable validation
  inngest/
    client.ts                         # Inngest client + Sentry middleware
    functions/
      scan.ts                         # Thin orchestrator (~40 lines)
      index.ts                        # Re-exports all functions
  scanner/
    lighthouse.ts                     # chrome-launcher + Lighthouse runner
    dom-checks.ts                     # Playwright runner, all DOM extractors
    header-checks.ts                  # Plain HTTP fetch for headers
    aggregate.ts                      # Merges 3 tracks into ScanDetailsV1
    store.ts                          # Writes scan to database
    scoring.ts                        # Score calculation, traffic light, category builder
    checks/
      lighthouse-helpers.ts           # Shared Lighthouse extraction utilities
      performance.ts                  # Lighthouse performance extractor
      seo.ts                          # Lighthouse SEO extractor
      seo-dom.ts                      # robots.txt, sitemap, structured data, Open Graph
      accessibility.ts                # axe-core WCAG 2.1 AA analysis
      legal.ts                        # Cookie banner, reject, tracking, privacy, contact
      legal-headers.ts                # SSL check
      security.ts                     # Lighthouse best-practices extractor
      security-headers.ts             # 7 security header checks
      standards.ts                    # Responsive, deprecated HTML, favicon, third-party
      index.ts                        # Re-exports all extractors
```

## API Integration

The Cloudflare Workers API (`apps/api`) triggers scans:

1. User submits URL + email on landing page
2. API receives request, validates URL
3. Upserts lead by email in Supabase
4. POSTs Inngest event to `https://inn.gs/e/<key>` with `{ leadId, url }`
5. Returns `{ status: "accepted", leadId }` immediately
6. Jobs app picks up the event and runs the scan pipeline

## Future Phases

**Phase 2 (after initial traction):**
- PDF report download
- Social sharing ("Share your score")
- Comparison tool ("See how your competitors score")
- Re-scan ("Check your progress after we rebuild")

**Phase 3 (integration with main platform):**
- Scan results feed into the migration pipeline
- Before/after comparison (scan score pre vs. post migration)
- Automated "your site improved" email after rebuild completes
