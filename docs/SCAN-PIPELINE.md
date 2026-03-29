# Scan Pipeline -- Implementation Plan

Full scan pipeline for the Free Website Scan. Three parallel data collection tracks feed into 6 scored categories.

## Architecture

```
scan.requested event (Inngest)
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

### Why parallel tracks instead of per-category steps

- **Lighthouse runs all its categories in a single pass.** One run with `onlyCategories: ['performance', 'seo', 'best-practices']` returns everything at once.
- **Playwright DOM checks share one page load.** Cookie banner, axe-core, structured data, deprecated HTML -- all inspect the same loaded DOM.
- **Security headers need no browser.** A `fetch()` gives us response headers, SSL info, and HTTPS status.

### How 3 tracks map to 6 result categories

| Result category | Lighthouse | DOM checks | Header checks |
|---|---|---|---|
| Performance | Core Web Vitals, page weight, Speed Index | -- | -- |
| SEO | Meta tags, viewport, Lighthouse SEO score | Structured data, Open Graph, sitemap, robots.txt | -- |
| Accessibility | -- | axe-core WCAG 2.1 AA analysis (full) | -- |
| EU Legal | -- | Cookie banner, reject button, privacy policy, contact info, pre-consent tracking | SSL certificate |
| Security | Mixed content (best-practices) | -- | Security headers, HSTS, server version, HTTPS |
| Modern Standards | -- | Deprecated HTML, responsive check, favicon, third-party scripts | -- |

## What's built

### Completed (all 6 scans)

**Shared infrastructure:**
- Zod schemas in `@vivotiv/shared` (CheckResult, CategoryResult, ScanDetailsV1)
- Lighthouse extraction helpers (`scanner/checks/lighthouse-helpers.ts`) -- `extractLighthouseCategory()` works for any Lighthouse category
- Playwright DOM checks runner (`scanner/dom-checks.ts`) -- one page load, all extractors in parallel
- Header checks runner (`scanner/header-checks.ts`) -- plain HTTP fetch, returns URL/HTTPS/headers/status
- Scoring utilities (`scanner/scoring.ts`)
- Aggregation (`scanner/aggregate.ts`)
- Storage (`scanner/store.ts`)
- Inngest orchestrator (`inngest/functions/scan.ts`) with all 3 parallel steps active
- Dockerfile with Playwright base image
- tsup bundling with workspace packages
- Database schema and migrations

**Scan extractors:**
- Performance: `scanner/checks/performance.ts` (Lighthouse)
- SEO: `scanner/checks/seo.ts` (Lighthouse) + `scanner/checks/seo-dom.ts` (robots.txt, sitemap, structured data, Open Graph)
- Accessibility: `scanner/checks/accessibility.ts` (axe-core via `@axe-core/playwright`)
- Legal: `scanner/checks/legal.ts` (DOM: cookie banner, reject button, pre-consent tracking, privacy policy, cookie policy, contact info) + `scanner/checks/legal-headers.ts` (SSL)
- Security: `scanner/checks/security.ts` (Lighthouse best-practices) + `scanner/checks/security-headers.ts` (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, server exposure)
- Standards: `scanner/checks/standards.ts` (DOM: responsive design, deprecated HTML, favicon, third-party scripts)

## Scan #1: Performance & Speed (done)

### Data sources

**From Lighthouse** (`"performance"` category):
- Core Web Vitals: Largest Contentful Paint (LCP), Total Blocking Time (TBT, proxy for INP), Cumulative Layout Shift (CLS)
- First Contentful Paint (FCP), Time to First Byte (TTFB), Speed Index
- Total page weight, image optimization, render-blocking resources, HTTP/2 support
- Lighthouse assigns its own scores and weights -- audits with weight > 0 are metrics, audits with savings are opportunities, the rest are diagnostics

### How it fits

Performance is Lighthouse-only. The `extractLighthouseCategory(lhr, "performance")` helper splits audits into metrics (scored), opportunities (savings-based), and diagnostics (informational). Lighthouse's own category score is used as the final score.

### Scoring

- Lighthouse's performance category score (0-100) is used directly
- Status derived from score via `getTrafficLight()`: 0-40 fail, 41-70 warn, 71-100 pass
- Individual audit scores, thresholds, and display values come straight from Lighthouse

### Files created

```
scanner/lighthouse.ts                  -- chrome-launcher + Lighthouse runner
scanner/checks/performance.ts          -- Lighthouse performance extractor (thin wrapper around extractLighthouseCategory)
scanner/scoring.ts                     -- score calculation, traffic light, category builder, overall score
scanner/aggregate.ts                   -- merges all track results into ScanDetailsV1
scanner/store.ts                       -- writes scan to database
```

## Scan #2: SEO (done)

### Data sources

**From Lighthouse** (`"seo"` category):
- Meta title, meta description, viewport, canonical, hreflang
- Image alt text, crawlable anchors, robots directives
- Lighthouse assigns its own scores and weights

**From DOM checks** (Playwright):
- `robots.txt` exists and allows indexing
- `sitemap.xml` exists and is valid XML
- Structured data (JSON-LD `<script>` tags)
- Open Graph tags (`og:title`, `og:description`, `og:image`)

### How it fits

Lighthouse SEO audits use the same `extractLighthouseCategory` pattern as performance. DOM extras are placed as diagnostics (don't affect score -- Lighthouse's SEO score is used as-is).

### Files created

```
scanner/checks/lighthouse-helpers.ts   -- shared Lighthouse extraction utilities (extracted from performance.ts)
scanner/checks/seo.ts                  -- Lighthouse SEO extractor
scanner/checks/seo-dom.ts             -- DOM-based SEO extras
scanner/dom-checks.ts                  -- Playwright runner (shared by all DOM scans)
```

## Scan #3: Accessibility (done)

### Data sources

**From DOM checks** (axe-core via Playwright, exclusively):
- Full WCAG 2.1 AA analysis via `@axe-core/playwright`
- Lighthouse uses axe-core under the hood -- running axe-core directly gives broader coverage without duplicates
- Filter: `.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])`
- Violations = fail, incomplete = warn, passes = pass

### Scoring

- Impact maps to weight: critical = 3, serious = 2, moderate = 1, minor = 1
- All checks go into metrics (all affect score)
- Score calculated by `buildCategoryResult` from weighted metrics

### Files created

```
scanner/checks/accessibility.ts        -- axe-core runner + CheckResult conversion
```

## Scan #4: EU Legal Compliance (done)

### Data sources

**From DOM checks** (Playwright):
- Cookie consent banner (known selectors: CookieBot, OneTrust, generic patterns + text fallback)
- Reject/decline button (known selectors + text search, English + Swedish)
- Pre-consent tracking (script tags matching GA, Meta Pixel, Hotjar, Clarity)
- Privacy policy link (English + Swedish patterns)
- Cookie policy link
- Contact information (Swedish org numbers, postal codes, street names)

**From header checks:**
- SSL certificate (HTTPS status)

### How it fits

All legal checks go into metrics (compliant or not -- no opportunities/diagnostics split). SSL check comes from the header-checks track, everything else from DOM.

### Files created

```
scanner/checks/legal.ts                -- DOM-based legal compliance checks
scanner/checks/legal-headers.ts        -- SSL check from header results
scanner/header-checks.ts               -- plain HTTP fetch runner (shared by legal + security)
```

## Scan #5: Security (done)

### Data sources

**From Lighthouse** (`"best-practices"` category):
- Mixed content (HTTP resources on HTTPS page)
- Deprecated APIs, vulnerable libraries
- Lighthouse assigns its own scores and weights

**From header checks** (existing header-checks track):
- Content-Security-Policy: present -> pass, missing -> fail (weight 2)
- Strict-Transport-Security: present with max-age >= 31536000 -> pass, low max-age -> warn, missing -> fail (weight 2)
- X-Frame-Options: present -> pass, missing -> warn (weight 1)
- X-Content-Type-Options: `nosniff` -> pass, other/missing -> warn (weight 1)
- Referrer-Policy: present -> pass, missing -> warn (weight 1)
- Permissions-Policy: present -> pass, missing -> warn (weight 1)
- Server version exposure: no version -> pass, version exposed -> warn (weight 1)

### How it fits

Lighthouse best-practices metrics + header checks are merged. Header checks go into metrics alongside Lighthouse metrics. Lighthouse's category score is used when available. Lighthouse best-practices opportunities and diagnostics are passed through.

### Files created

```
scanner/checks/security.ts             -- Lighthouse best-practices extractor (thin wrapper)
scanner/checks/security-headers.ts     -- 7 security header checks from header-checks track
```

## Scan #6: Modern Web Standards (done)

### Data sources

**From DOM checks** (entirely Playwright-based):
- Responsive design: viewport meta tag with `width=device-width` (weight 3)
- Deprecated HTML: `<font>`, `<center>`, `<marquee>`, `<blink>`, `<big>`, `<strike>`, layout tables without headers (weight 2)
- Favicon: `<link rel="icon">` or `/favicon.ico` fallback (weight 1)
- Third-party scripts: count unique external script origins, warn > 10, fail > 20 (weight 2)

### How it fits

Entirely DOM-based. Runs on the same Playwright page as SEO, Accessibility, and Legal. All checks go into metrics. No new tracks needed.

### Files created

```
scanner/checks/standards.ts         -- 4 modern standards checks from DOM
```

## Shared infrastructure

### Lighthouse extraction helpers (`scanner/checks/lighthouse-helpers.ts`)

Shared utilities: `lighthouseScoreToStatus`, `extractItems`, `stripMarkdownLinks`, `auditToCheckResult`, `clampWeight`, `formatScoringOption`, and `extractLighthouseCategory`. Any Lighthouse-based extractor calls `extractLighthouseCategory(lhr, categoryId)` and gets back metrics/opportunities/diagnostics/lighthouseScore.

### DOM checks runner (`scanner/dom-checks.ts`)

Launches Playwright, navigates to URL with `waitUntil: "load"`, runs all DOM extractors in parallel via `Promise.all`, returns a flat `DomCheckResults` object with named sections. New extractors are added by importing and calling them against the page.

### Header checks runner (`scanner/header-checks.ts`)

Plain `fetch()` with 15s timeout, follows redirects. Returns URL, HTTPS status, response headers as a flat record, and status code. Used by legal (SSL) and security (headers) extractors.

### Implementation order

1. **SEO** -- introduced DOM checks track + Lighthouse category extension pattern (done)
2. **Accessibility** -- added axe-core to DOM track (done)
3. **Legal** -- introduced header checks track (done)
4. **Security** -- extends Lighthouse (best-practices) + header track
5. **Standards** -- pure DOM checks, no new infrastructure
