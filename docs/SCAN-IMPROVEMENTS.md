# Scan Improvements Plan

Working document for expanding the website scan based on analysis of squirrelscan's 230+ rule audit tool and gaps in our current implementation.

## Context

Our scan targets Swedish SMBs with aging websites. It runs a single-page scan in 15-20 seconds and returns a scorecard designed to start a sales conversation. We are not building a comprehensive SEO audit tool. Every addition must pass this filter: **does this finding make a business owner think "I need to fix this"?**

The initial gap analysis was done against squirrelscan (230+ rules, 21 categories, HTTP-only crawler). That analysis is complete and the decisions are captured in this document.

## Guiding principle: official tools over heuristics

We only add checks that produce reliable, deterministic results. That means:

- **Use official tools and APIs** (Lighthouse, axe-core, MDN Observatory, W3C Validator, Google Web Risk) over hand-rolled pattern matching
- **Use established libraries** (linkinator for broken links) over custom HTTP request management
- **Drop checks that rely on heuristic guessing** (trust signal detection, secret scanning patterns) where false positives/negatives undermine credibility
- If no reliable tool exists for a check, we skip it rather than ship something fragile

## Category reframing

### "Modern Web Standards" becomes "Website Quality"

Current Standards category has 4 thin checks (responsive viewport, deprecated HTML, favicon, third-party script count). "Modern web standards" does not create urgency for a business owner.

Rename to "Website Quality" and add checks that answer "Is this website built and maintained properly?":

- Broken links on page (via linkinator)
- W3C HTML validation (via Nu HTML Checker, replaces deprecated HTML heuristic)
- Heading structure (multiple H1s, skipped levels)
- Content signals (thin content, missing lang attribute)
- URL hygiene (uppercase, underscores, excessive parameters)

### Proposal: Rename "EU Legal Compliance" to "Trust & Compliance"

Enrich the existing Legal category without adding a new one (avoids scoring weight, frontend layout, and database schema changes):

- Keep all current legal checks (cookie banner, reject option, tracking, privacy/cookie policy, contact info, SSL)
- Add: about page detection (scan links for about/om-oss/om/about-us patterns)
- Rename "EU Legal Compliance" to "Trust & Compliance" in the UI

### Scoring weights

No weight changes. Categories get richer, not restructured. Weights stay: Performance 20%, SEO 20%, Accessibility 20%, Trust & Compliance (was Legal) 20%, Security 10%, Website Quality (was Standards) 10%.

## New checks: implementation plan

### Priority 1: High impact, reliable tools

These checks use either the Playwright page object we already have (deterministic DOM queries) or official external tools/APIs. No heuristic pattern matching.

#### 1.1 Heading structure (add to Website Quality)

**What:** Check for multiple H1 tags, skipped heading levels, empty headings.

**Why:** "Your page has 4 H1 tags and jumps from H2 to H5" signals a sloppy build. SEO-aware business owners know H1 matters. This is also an accessibility signal but surfaced here as a quality/SEO concern.

**Implementation:**
- New check function in `checks/standards.ts`
- Pure `page.evaluate()` - no HTTP requests needed
- Checks:
  - Exactly one H1 (fail if 0 or >1)
  - No skipped levels (H1 then H3 without H2 = warn)
  - No empty headings (warn)
- Weight: 1
- Items: list of heading issues

**Estimated effort:** Small. Pure DOM query, no external requests.

#### 1.2 Content basics (add to Website Quality)

**What:** Check for thin content (very low word count), missing lang attribute.

**Why:** "Your page has 43 words of content" signals an abandoned or placeholder page. Very common on aging SMB sites with "Lorem ipsum" still lurking.

**Implementation:**
- New check function in `checks/standards.ts`
- Uses `page.evaluate()` to:
  - Count words in main content area (excluding nav, header, footer, scripts)
  - Check `<html lang="...">` attribute exists and is valid
- Weight: 1
- Status: fail if <50 words, warn if <200, pass if 200+
- Also: warn if lang attribute is missing (relevant for Swedish SEO and accessibility)

**Estimated effort:** Small. Pure DOM query.

#### 1.3 URL structure (add to Website Quality)

**What:** Check the current page URL for common hygiene issues.

**Why:** Less impactful than broken links or images, but still a signal of quality. "Your URL contains uppercase characters and special characters" is easy to understand.

**Implementation:**
- New check function in `checks/standards.ts`
- Pure string analysis on `page.url()`:
  - Uppercase characters in path (warn)
  - Underscores instead of hyphens (warn)
  - Excessive query parameters (>3 = warn)
  - Double slashes in path (warn)
  - Very long URL (>200 chars = warn)
- Weight: 1
- This is a lightweight check - no HTTP requests, no DOM queries

**Estimated effort:** Small. String regex on a single URL.

#### 1.4 MDN HTTP Observatory (upgrade Security category)

**What:** Use Mozilla's official MDN HTTP Observatory API to get an authoritative security header grade.

**Why:** We already check security headers manually in `security-headers.ts`. The MDN Observatory does the same thing but returns a standardized letter grade (A+ to F), checks additional things we do not (cookie security, CORS, subresource integrity, HTTP-to-HTTPS redirect quality), and is maintained by Mozilla/MDN staff. Despite low GitHub stars (~116), it is the official successor to Mozilla Observatory, hosted on Mozilla infrastructure, and linked from MDN docs.

**Implementation:**
- Single API call: `POST https://observatory-api.mdn.mozilla.net/api/v2/scan?host=<HOST>`
- Free, no auth required
- Rate limit: one scan per host per 60 seconds (returns cached result otherwise)
- Returns: grade (A+ to F), score (0-135), pass/fail for 10 security tests
- Run as part of a new API track in parallel with Lighthouse, DOM, and Headers
- Weight: 2
- Status: map grade to pass (A/A+), warn (B/C), fail (D/F)
- Items: list of failed tests with descriptions

**Estimated effort:** Small. Single HTTP call, parse JSON response.

#### 1.5 Google Web Risk API (add to Security)

**What:** Check if the scanned URL is flagged by Google as malware, social engineering, or unwanted software.

**Why:** "Your website is flagged by Google as potentially dangerous" is a devastating finding for a business owner. This checks against the same database Chrome uses to show red warning pages.

**Implementation:**
- Single API call to Google Web Risk API
- Free tier: 100,000 lookups/month (more than enough)
- Requires a Google Cloud API key
- Returns: threat types if flagged, empty if clean
- Weight: 3 (this is critical if found)
- Status: fail if any threat detected, pass if clean
- Items: list of threat types

**Estimated effort:** Small. Single API call.

#### 1.6 Broken links (add to Website Quality)

**What:** Check all links on the page for 404/5xx responses.

**Why:** Broken links are the most universally understood website problem. Every business owner has encountered a 404 page. "Your website has 7 broken links" needs no explanation.

**Implementation:**
- Use **linkinator** npm library (800+ stars, actively maintained) instead of hand-rolling HTTP request management
- Linkinator handles concurrency, timeouts, redirect following, and checks links, images, scripts, and stylesheets
- Configure with: concurrency limit, timeout per request, recurse: false (single page only)
- Weight: 2
- Status: fail if any broken, warn if slow responses, pass if all resolve
- Items: list of broken URLs with status codes

**Estimated effort:** Medium. Library integration + timeout management to stay within scan budget.

**Timeout:** 30 seconds total cap. Return partial results (broken links found so far) if timeout hits. If no response at all, skip this check silently.

### Priority 2: Medium impact, moderate effort

#### 2.1 W3C HTML validation (upgrade Website Quality, replace deprecated HTML check)

**What:** Validate the page HTML against the W3C HTML spec using the official Nu HTML Checker.

**Why:** Our current "deprecated HTML" check is a heuristic DOM query. The W3C's own validator catches far more: malformed HTML, spec violations, missing required attributes, nesting errors. "Your website has 23 HTML validation errors" is concrete and authoritative.

**Implementation:**
- Public endpoint: `POST https://validator.w3.org/nu/?out=json` with `Content-Type: text/html`
- POST the HTML content directly (already available from Playwright via `page.content()`)
- Parse JSON response: count errors vs warnings, extract message text
- Log errors to Sentry. If validator is down or rate-limited, skip check silently (never report a fail because of our tooling)
- Weight: 2
- Status: fail if >10 errors, warn if 1-10 errors, pass if 0 errors
- Items: list of error messages (capped at most impactful)
- Replaces the current deprecated HTML check entirely

**Estimated effort:** Medium. HTTP call + response parsing + fallback strategy for rate limits.

#### 2.2 About page detection (add to Trust & Compliance)

**What:** Check if the site has a discoverable about/om-oss page.

**Why:** "Your website has no about page" tells a business owner their site looks untrustworthy. For local businesses, trust is conversion-critical.

**Implementation:**
- New check function in `checks/legal.ts`
- Scans all `<a href>` for about/om-oss/om/about-us patterns
- Optionally: HEAD request to verify the page exists (200)
- Weight: 1
- Status: warn if missing (not fail, since some businesses legitimately skip this)

**Estimated effort:** Small. Link text/href scanning is straightforward and deterministic.

## Implementation approach

### Architecture: new API track for external services

The three existing tracks (Lighthouse, DOM, Headers) remain unchanged. Add a fourth parallel track for external API calls:

- **API track:** MDN Observatory, Google Web Risk, W3C Validator (all independent HTTP calls, run concurrently within the track)
- **DOM track additions:** heading structure, content basics, about page detection, URL structure
- **Library track:** linkinator for broken links (runs in parallel with everything else)

All tracks run concurrently via `Promise.allSettled()`. Each external API call wrapped in a 10-second timeout. Failures treated as "could not check" rather than scan errors.

### Timing budget

Current scan: ~15-20 seconds. The DOM track runs in parallel with Lighthouse and headers, so DOM check time is currently hidden behind Lighthouse's ~10-15 second runtime.

**Checks with no HTTP overhead** (add ~0ms to DOM track):
- Heading structure
- Content basics
- URL structure

**External API calls** (run in parallel, new API track):
- MDN Observatory: ~2-5 seconds typical
- Google Web Risk: <1 second
- W3C Validator: ~2-5 seconds typical

**Library-based checks** (run in parallel):
- Broken links via linkinator: 30 second cap, partial results on timeout

Worst case: 30 seconds for broken links. Lighthouse typically finishes in 10-15 seconds, so broken links may extend total scan time to ~30 seconds. All other checks finish well within that window.

### File changes

**Modified files:**
- `checks/standards.ts` - add heading structure, content basics, URL structure checks; replace deprecated HTML check with W3C validator results
- `checks/legal.ts` - add about page detection
- `scanner/dom-checks.ts` - add new checks to parallel array
- `scanner/aggregate.ts` - update category names in aggregation

**New files:**
- `scanner/api-checks.ts` - new track for MDN Observatory + Google Web Risk + W3C Validator
- `checks/observatory.ts` - MDN Observatory API integration
- `checks/web-risk.ts` - Google Web Risk API integration
- `checks/html-validation.ts` - W3C Nu HTML Checker integration
- `checks/broken-links.ts` - linkinator integration

**Shared package changes:**
- `packages/shared/src/scan/categories.ts` - rename category keys if changing names

**Frontend changes (not in scope for this plan but will be needed):**
- Category display names
- Possibly new icons for renamed categories
- Updated descriptions/helper text

### Rollout order

**Phase 1: New checks + category rename (ship together)**

1. Rename "Modern Web Standards" to "Website Quality" and "EU Legal Compliance" to "Trust & Compliance" across all projects
2. Heading structure (Website Quality) - pure DOM
3. Content basics (Website Quality) - pure DOM
4. URL structure (Website Quality) - pure string analysis
5. MDN Observatory (Security) - API call
6. Google Web Risk (Security) - API call
7. Broken links via linkinator (Website Quality) - library

**Phase 2: W3C validator + about page**

1. W3C HTML validation, replaces deprecated HTML check (Website Quality)
2. About page detection (Trust & Compliance)

## Decisions log

Checks evaluated and dropped:

| Check | Reason dropped |
|---|---|
| **Trust signal detection** | Too fragile. Review widgets, certification badges, and social proof look completely different across sites. No reliable way to detect without high false positive/negative rates. |
| **Leaked secrets scan** | Not relevant for SMB audience. Service companies and small businesses rarely use API keys in frontend code. Would mostly produce false positives (e.g. intentionally public Google Maps keys). |
| **Enhanced structured data validation** | No reliable tooling exists. Adobe's validator is unmaintained (9 stars). Google's schemarama is abandoned. Google Rich Results Test has no public API. Current "does JSON-LD exist?" check is sufficient. |
| **Image issues check** | Lighthouse already covers this via `uses-webp-avif`, `uses-optimized-images`, `uses-responsive-images`, `offscreen-images`, and `unsized-images` audits. Adding a separate check would be redundant. |

## Constraints

- **Single-page scan only.** No multi-page crawling. Must stay within 15-20 second time budget.
- **6 categories, no new ones.** Keeps scorecard clean, avoids schema changes.
- **No heuristic pattern matching.** If there is no official tool or deterministic method, we skip the check.

## Resolved decisions

1. **Broken links timeout:** 30 seconds total cap. Report whatever broken links were found by then, ignore the rest. If linkinator returns no response at all (full timeout, no partial results), ignore this check entirely and do not report it.

2. **W3C Validator:** Use public endpoint (`validator.w3.org/nu`). Log errors to Sentry. Fail gracefully: if the validator is down or rate-limited, skip this check silently. Never report a fail to the user because our tooling had an issue.

3. **Category renaming:** Rename at the same time as adding checks (not phased). **IMPORTANT: the rename must be applied across the entire codebase and all connected projects (web, API, jobs, shared package, database seeds, email templates, marketing copy). Do a full search for old category names before considering the rename complete.**

4. **MDN Observatory caching:** Acceptable. The API caches results per host for 60 seconds. No action needed.

5. **Google Web Risk API key:** Existing Google Cloud project. Key stored in `.env.local` locally and env vars on Railway.
