# Scan Pipeline -- Implementation Plan

Full scan pipeline implementation for the Free Website Scan. Builds all 6 scan categories one at a time, with shared architecture in place from the start.

## Architecture overview

Three parallel data collection tracks, then aggregate and store:

```
scan.requested event (Inngest)
  |
  |-- step: "run-lighthouse"       ONE Lighthouse run, all categories at once
  |     -> extracts: performance, seo (partial), accessibility (partial), security (partial)
  |
  |-- step: "run-dom-checks"       ONE Playwright page load, all DOM inspections
  |     -> extracts: legal, standards, seo extras, accessibility (axe-core)
  |
  |-- step: "run-header-checks"    Plain HTTP fetch, no browser needed
  |     -> extracts: security headers, HTTP/2, SSL, server exposure
  |
  (all three run in parallel via Promise.all)
  |
  -> step: "aggregate-scores"      Merge results from all 3 tracks into 6 categories
  -> step: "store-results"         Write scan row to Supabase
  -> step: "notify"                Update lead status, send email (future)
```

### Why parallel tracks instead of per-category steps

- **Lighthouse runs all its categories in a single pass.** Calling it 4 times for performance, SEO, accessibility, and best-practices would mean 4 Chrome launches and 4 page loads. One run with `onlyCategories: ['performance', 'seo', 'accessibility', 'best-practices']` returns everything at once.
- **Playwright DOM checks share one page load.** Cookie banner detection, deprecated HTML, axe-core, heading hierarchy, structured data -- all inspect the same loaded DOM. Load the page once, run all checks against it.
- **Security headers need no browser at all.** A simple `fetch()` gives us response headers, SSL info, and HTTP/2 support. No reason to wait for a browser.

This brings wall time from ~60s (sequential) down to ~15-20s (parallel).

### How 3 tracks map to 6 result categories

The 6 categories in the scan results don't map 1:1 to collection tracks. Data gets split and merged during aggregation:

| Result category | Data from Lighthouse | Data from DOM checks | Data from header checks |
|---|---|---|---|
| Performance | Core Web Vitals, page weight, Speed Index | -- | -- |
| SEO | Meta tags, mobile viewport, Lighthouse SEO score | Structured data, Open Graph, sitemap, robots.txt, broken links | -- |
| Accessibility | Lighthouse a11y score (baseline) | axe-core deep WCAG analysis | -- |
| EU Legal | -- | Cookie banner, reject button, privacy policy, contact info, pre-consent tracking | SSL certificate |
| Security | Lighthouse best-practices (mixed content) | -- | Security headers (CSP, HSTS, X-Frame), server version, HTTPS |
| Modern Standards | -- | Deprecated HTML, responsive check, favicon, third-party scripts | -- |

## Key decisions

- **Lighthouse via chrome-launcher, DOM checks via Playwright**: Two separate browser instances. Lighthouse manages its own Chrome DevTools connection. Playwright handles DOM inspection and axe-core injection. Both launch in parallel.
- **Versioned details schema**: The `details` JSONB column includes a `version` field (integer, starting at `1`). The frontend reads the version to know which Zod schema to use for parsing. When we change the structure, we bump the version and add a new schema.
- **Zod schemas in `@vivotiv/shared`**: All scan result types are defined as Zod schemas so both the jobs app (writing) and web app (reading) share the exact same types.
- **3 parallel Inngest steps for collection, then sequential for aggregation + storage**: Collection steps run via `Promise.all()` for speed. Aggregation and storage are sequential because they depend on the collected data.

## Shared types (`@vivotiv/shared`)

### Check result shape

Every individual check across all 6 categories follows this shape:

```typescript
{
  id: string           // e.g. "lcp", "meta-title", "color-contrast"
  name: string         // Human-readable: "Largest Contentful Paint"
  status: "pass" | "warn" | "fail"
  value: string | null // Measured value: "4.2s", "missing", "true"
  threshold: string | null // Expected: "< 2.5s", "present", ">= 4.5:1"
  weight: number       // 1-3, used for score calculation
  description: string  // What this check measures
  recommendation: string | null // How to fix (null if pass)
}
```

### Category result shape

```typescript
{
  score: number           // 0-100
  status: "pass" | "warn" | "fail"  // Traffic light derived from score
  checks: CheckResult[]
}
```

### Full scan details (versioned)

```typescript
{
  version: 1
  url: string             // The URL that was actually scanned (after redirects)
  scannedAt: string       // ISO timestamp
  performance: CategoryResult | null
  seo: CategoryResult | null
  accessibility: CategoryResult | null
  legal: CategoryResult | null
  security: CategoryResult | null
  standards: CategoryResult | null
}
```

Categories are nullable so we can ship with only some categories implemented and add the rest incrementally. The frontend renders whatever is present.

## Scan #1: Performance & Speed

### What it does

Runs a Lighthouse audit and extracts the performance category results. This is the first track to implement ("run-lighthouse"), starting with only `onlyCategories: ['performance']`. As we add SEO, accessibility, and security scans later, we expand the categories array in the same Lighthouse run -- no new steps needed.

### Dependencies to add

```
apps/jobs/package.json:
  lighthouse        (Lighthouse Node API)
  chrome-launcher   (Launch headless Chrome for Lighthouse)
```

### Checks to implement

| Check ID | Name | Source | Weight | Threshold |
|---|---|---|---|---|
| `lcp` | Largest Contentful Paint | Lighthouse `largest-contentful-paint` | 3 | Good: <= 2.5s, Warn: <= 4.0s |
| `cls` | Cumulative Layout Shift | Lighthouse `cumulative-layout-shift` | 3 | Good: <= 0.1, Warn: <= 0.25 |
| `tbt` | Total Blocking Time | Lighthouse `total-blocking-time` (proxy for INP) | 3 | Good: <= 200ms, Warn: <= 600ms |
| `fcp` | First Contentful Paint | Lighthouse `first-contentful-paint` | 2 | Good: <= 1.8s, Warn: <= 3.0s |
| `ttfb` | Time to First Byte | Lighthouse `server-response-time` | 2 | Good: <= 800ms, Warn: <= 1800ms |
| `speed-index` | Speed Index | Lighthouse `speed-index` | 2 | Good: <= 3.4s, Warn: <= 5.8s |
| `page-weight` | Total Page Weight | Lighthouse `total-byte-weight` | 2 | Good: <= 2MB, Warn: <= 4MB |
| `image-optimization` | Image Optimization | Lighthouse `uses-optimized-images` + `modern-image-formats` | 2 | Pass: no savings, Warn: < 500KB, Fail: >= 500KB |
| `render-blocking` | Render-blocking Resources | Lighthouse `render-blocking-resources` | 1 | Pass: none, Warn: 1-2, Fail: 3+ |
| `http2` | HTTP/2 Support | Lighthouse `uses-http2` | 1 | Pass/Fail |

### File structure

```
apps/jobs/src/
  scanner/
    lighthouse.ts                 # chrome-launcher + Lighthouse runner
    scoring.ts                    # Score calculation + traffic light utils
    checks/
      performance.ts              # Extract performance checks from Lighthouse result
      index.ts                    # Re-exports all check extractors
  inngest/
    functions/
      scan.ts                     # Updated: real pipeline with parallel steps

packages/shared/src/
  scan/
    results.ts                    # Zod schemas: CheckResult, CategoryResult, ScanDetails
    categories.ts                 # (existing) category keys
```

### Todo list

#### 1. Define Zod schemas for scan results in `@vivotiv/shared`

- [ ] Create `packages/shared/src/scan/results.ts`
  - `CheckResultSchema` -- single check with id, name, status, value, threshold, weight, description, recommendation
  - `CategoryResultSchema` -- score (0-100), status (pass/warn/fail), checks array
  - `ScanDetailsV1Schema` -- version: 1, url, scannedAt, 6 nullable category results
  - `ScanDetailsSchema` -- discriminated union on version (just v1 for now)
  - Export all types
- [ ] Update `packages/shared/src/index.ts` to export new schemas
- [ ] Run `pnpm typecheck` to verify

#### 2. Create scoring utilities

- [ ] Create `apps/jobs/src/scanner/scoring.ts`
  - `calculateCategoryScore(checks)` -- weighted score: checks with status "pass" get full weight, "warn" gets half, "fail" gets zero. Score = sum(earned) / sum(maxWeight) * 100
  - `getTrafficLight(score)` -- 0-40: fail, 41-70: warn, 71-100: pass
  - `calculateOverallScore(categories, weights)` -- weighted average across present (non-null) categories using the weights from the spec (Performance: 20%, SEO: 20%, Accessibility: 20%, Legal: 20%, Security: 10%, Standards: 10%)

#### 3. Create Lighthouse runner

- [ ] Install dependencies: `pnpm --filter jobs add lighthouse chrome-launcher`
- [ ] Check if `chrome-launcher` ships types (it does -- no separate `@types` package needed)
- [ ] Create `apps/jobs/src/scanner/lighthouse.ts`
  - `runLighthouse(url: string, categories: string[]): Promise<LighthouseResult>`
  - Launches headless Chrome via chrome-launcher with Docker-safe flags (`--no-sandbox`, `--disable-gpu`, `--disable-dev-shm-usage`)
  - Runs Lighthouse with specified categories + json output
  - Returns the `lhr` (Lighthouse Result) object
  - Always kills Chrome in a `finally` block

#### 4. Implement performance check extraction

- [ ] Create `apps/jobs/src/scanner/checks/performance.ts`
  - `extractPerformanceChecks(lhr: LighthouseResult): CheckResult[]`
  - Maps each Lighthouse audit to our `CheckResult` format
  - Each check: reads `lhr.audits[auditId]`, extracts `numericValue` or `score`, applies our thresholds, writes human-readable `value`/`threshold`/`description`/`recommendation`
- [ ] Create `apps/jobs/src/scanner/checks/index.ts` -- re-exports

#### 5. Wire up the Inngest scan function

- [ ] Update `apps/jobs/src/inngest/functions/scan.ts`
  - Replace placeholder with real steps:
    ```typescript
    // Phase 1: parallel data collection (only Lighthouse for now)
    const [lighthouseResult] = await Promise.all([
      step.run("run-lighthouse", () => runLighthouse(url, ["performance"])),
      // step.run("run-dom-checks", ...) -- added later
      // step.run("run-header-checks", ...) -- added later
    ]);

    // Phase 2: extract checks from raw results
    const performanceChecks = extractPerformanceChecks(lighthouseResult);

    // Phase 3: aggregate
    const details = await step.run("aggregate-scores", () => {
      // Build CategoryResults, calculate scores, return ScanDetailsV1
    });

    // Phase 4: store
    await step.run("store-results", () => {
      // Write to database
    });
    ```
  - The `Promise.all` pattern means adding DOM checks and header checks later is just uncommenting + adding the new step

#### 6. Add database query for storing scan results

- [ ] Add `createScan` insert query in `packages/db` (if not already present)
  - Accepts: leadId, url, overallScore, per-category scores, details JSONB
  - Returns the created scan row
- [ ] Export from `packages/db`

#### 7. Update Dockerfile for Chrome

- [ ] Verify Dockerfile installs Chromium system deps (it does -- `npx playwright install-deps chromium`)
- [ ] Add `npx playwright install chromium` to install the actual Chromium binary (system deps alone are not enough)
- [ ] Set `CHROME_PATH` env var so chrome-launcher finds the Playwright-installed Chromium
- [ ] Alternatively: install Google Chrome for Testing directly if Playwright's Chromium causes issues with Lighthouse

#### 8. Local testing

- [ ] `pnpm typecheck` passes for all packages
- [ ] `pnpm --filter jobs dev` starts cleanly
- [ ] Trigger a scan event via Inngest dev server with a test URL
- [ ] Verify Lighthouse runs and returns performance scores
- [ ] Verify scan results are stored in Supabase with correct schema
- [ ] Verify `details` JSONB matches `ScanDetailsV1Schema`

#### 9. Database migration

- [ ] Generate a new Drizzle migration for the `url` column added to the `scans` table
- [ ] Run migration against Supabase (handled by `deploy-api.yml` in production)

#### 10. Docker verification

- [ ] `docker build -f apps/jobs/Dockerfile .` succeeds
- [ ] Chrome/Lighthouse can run inside the container
- [ ] Test with a known URL and verify scores match local results

## Adding future scans

Each new scan extends the existing architecture rather than creating new Inngest steps:

### To add SEO, Accessibility, or Security (Lighthouse-based):

1. Add a new check extractor in `scanner/checks/` (e.g. `seo.ts`)
2. Expand the categories array in the existing `runLighthouse()` call: `["performance", "seo"]`
3. Call the new extractor in the aggregate step
4. No new Inngest steps -- same Lighthouse run covers it

### To add Legal, Standards, or deeper Accessibility (DOM-based):

1. Add a new check extractor in `scanner/checks/` (e.g. `legal.ts`)
2. Create `scanner/dom-checks.ts` -- launches Playwright, loads page, runs all DOM extractors
3. Uncomment the `step.run("run-dom-checks", ...)` line in the Inngest function
4. Merge DOM results into the aggregate step

### To add Security headers:

1. Add check extractor in `scanner/checks/headers.ts`
2. Create `scanner/header-checks.ts` -- plain `fetch()`, inspects response headers
3. Uncomment the `step.run("run-header-checks", ...)` line
4. Merge header results into the aggregate step
