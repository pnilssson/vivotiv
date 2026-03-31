# Scan Improvements Plan

Working document for expanding the website scan based on analysis of squirrelscan's 230+ rule audit tool and gaps in our current implementation.

## Context

Our scan targets Swedish SMBs with aging websites. It runs a single-page scan in 15-20 seconds and returns a scorecard designed to start a sales conversation. We are not building a comprehensive SEO audit tool. Every addition must pass this filter: **does this finding make a business owner think "I need to fix this"?**

Squirrelscan is an HTTP-based multi-page crawler with 230+ rules across 21 categories. It cannot run a browser, so it cannot measure real Core Web Vitals, run axe-core, or detect pre-consent tracking behavior. But it covers ground we do not touch at all, and some of those gaps matter for our audience.

## What we already do well

These are genuine advantages over squirrelscan that we should protect, not dilute:

- **Real Lighthouse performance** with actual Core Web Vitals
- **axe-core accessibility** across desktop and mobile viewports
- **Pre-consent tracking detection** via Playwright network interception
- **CMP detection** with 30+ cookie banner selectors including shadow DOM
- **TLS certificate inspection** with protocol version and expiry
- **EU Legal Compliance** as a distinct, business-relevant category

## Category reframing

### Problem: "Modern Web Standards" is weak

Currently 4 checks: responsive viewport, deprecated HTML, favicon, third-party script count. The name is vague, the checks are thin, and "modern web standards" does not create urgency for a business owner. A plumber in Gothenburg does not care about "modern web standards."

### Proposal: Rename to "Website Quality"

Absorb the existing 4 standards checks and add new checks that answer: "Is this website built and maintained properly?" This becomes the catch-all for tangible quality signals that do not fit in the other five categories.

New checks for this category (details in implementation section below):

- Broken links on page
- Image issues (missing dimensions, oversized files, no modern formats)
- Heading structure (multiple H1s, skipped levels)
- Content signals (thin content, missing lang attribute)
- URL hygiene (uppercase, underscores, excessive parameters)

This turns a filler category into something with 9-10 visible checks and clear business relevance.

### Problem: Trust signals buried across categories

We check privacy policy and contact info in Legal. Squirrelscan has an entire E-E-A-T category (14 rules) covering about pages, trust signals, physical addresses, content dates. For SMBs, "does your website look trustworthy?" is a powerful question.

### Proposal: Add trust checks to Legal, rename to "Trust & Compliance"

Rather than creating a new category (which changes scoring weights, frontend layout, and database schema), enrich the existing Legal category:

- Keep all current legal checks (cookie banner, reject option, tracking, privacy/cookie policy, contact info, SSL)
- Add: about page detection
- Add: physical address visibility (extend existing contact check)
- Add: trust signals (reviews, certifications, social proof)
- Rename "EU Legal Compliance" to "Trust & Compliance" in the UI

This keeps the architecture stable (still 6 categories) while making the category feel more complete and the name more compelling.

### Scoring weight adjustment

Current weights:

| Category | Current weight |
|---|---|
| Performance | 20% |
| SEO | 20% |
| Accessibility | 20% |
| Legal | 20% |
| Security | 10% |
| Standards | 10% |

Proposed weights after reframing:

| Category | Proposed weight | Rationale |
|---|---|---|
| Performance | 20% | Unchanged, core signal |
| SEO | 20% | Unchanged, core signal |
| Accessibility | 20% | Unchanged, EU Accessibility Act |
| Trust & Compliance | 20% | Unchanged, renamed from Legal |
| Security | 10% | Unchanged |
| Website Quality | 10% | Unchanged weight, renamed from Standards, but now denser with checks |

No weight changes needed. The categories get richer, not restructured.

## New checks: implementation plan

### Priority 1: High impact, fits existing architecture

These checks use the Playwright page object we already have and follow the exact `buildCheck()` pattern. No new tracks, no new dependencies.

#### 1.1 Leaked secrets scan (add to Security)

**What:** Regex scan of page HTML and inline/external JS for exposed API keys, database credentials, and tokens.

**Why:** This is the single most shocking finding a scan can produce. A business owner seeing "Your Google Maps API key is exposed in your source code" immediately understands the problem. Squirrelscan checks 96 patterns. We do not need all of them. Start with the 20-25 most common patterns found on SMB sites.

**Patterns to check (initial set):**
- Google Maps API keys (`AIza[0-9A-Za-z-_]{35}`)
- AWS access keys (`AKIA[0-9A-Z]{16}`)
- Generic API keys/secrets in HTML comments or data attributes
- Database connection strings (`mysql://`, `postgres://`, `mongodb://`)
- Private keys (`-----BEGIN.*PRIVATE KEY-----`)
- Slack webhooks, Stripe secret keys, SendGrid keys, Mailchimp keys
- Environment variable dumps (common in misconfigured frameworks)
- `.env` file content accidentally rendered

**Implementation:**
- New check function in `checks/security-headers.ts` or a new `checks/secrets.ts`
- Runs `page.content()` to get full HTML, then scans `<script>` tags with inline content
- Also checks `page.evaluate()` for `window.__ENV` and similar global config objects
- Weight: 3 (this is critical if found)
- Status: fail if any pattern matches, pass if clean
- Items: list of matched patterns (redacted values, just the type)

**Estimated effort:** Small. Regex matching on already-available page content.

#### 1.2 Broken links check (add to Website Quality)

**What:** Check all `<a href>` links on the page for 404/5xx responses. Check all `<img src>` for broken images.

**Why:** Broken links are the most universally understood website problem. Every business owner has encountered a 404 page. "Your website has 7 broken links" needs no explanation.

**Implementation:**
- New check function in `checks/standards.ts` (renamed to quality)
- Uses `page.evaluate()` to collect all unique href/src URLs
- Filters to same-origin + external HTTP(S) links (skip mailto:, tel:, javascript:, #anchors)
- Sends HEAD requests in parallel with a concurrency limit (5-10 concurrent)
- Timeout per request: 5 seconds
- Weight: 2
- Status: fail if any broken, warn if slow responses (>3s), pass if all resolve
- Items: list of broken URLs with status codes

**Estimated effort:** Medium. Need to manage parallel HTTP requests within the scan timeout budget. Must not let a slow external site blow up our scan time. Cap at checking first 50 links, 5s timeout per link, abort remaining after 15s total.

**Risk:** This is the check most likely to slow down scans. Need strict timeouts and a cap on checked URLs.

#### 1.3 Image issues (add to Website Quality)

**What:** Check images on the page for missing dimensions, oversized files, and lack of modern formats.

**Why:** "Your hero image is 4.2 MB and takes 6 seconds to load" is concrete and actionable. Swedish SMBs with aging WordPress sites often have unoptimized JPEG photos from 2015.

**Implementation:**
- New check function in `checks/standards.ts`
- Uses `page.evaluate()` to collect `<img>` elements: src, width/height attributes, naturalWidth/naturalHeight, loading attribute
- HEAD requests to get Content-Length and Content-Type for largest images
- Checks:
  - Missing width/height attributes (CLS contributor)
  - Large file sizes (>500KB warning, >1MB fail)
  - No modern format usage (all JPEG/PNG, no WebP/AVIF)
- Weight: 2
- Items: list of problematic image URLs with sizes

**Estimated effort:** Medium. Similar HTTP request pattern to broken links. Can batch with link checking.

#### 1.4 Heading structure (add to Website Quality)

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

#### 1.5 Content basics (add to Website Quality)

**What:** Check for thin content (very low word count), missing lang attribute, missing meta description length quality.

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

### Priority 2: Medium impact, moderate effort

#### 2.1 About page and trust signals (add to Trust & Compliance)

**What:** Check if the site has a discoverable about/om-oss page and visible trust indicators.

**Why:** "Your website has no about page" tells a business owner their site looks untrustworthy. E-E-A-T is a ranking factor, and for local businesses, trust is conversion-critical.

**Implementation:**
- New check function in `checks/legal.ts`
- Scans all `<a href>` for about/om-oss/om/about-us patterns
- Optionally: HEAD request to verify the page exists (200)
- Trust signals: look for common patterns like review widgets, certification badges, social media profile links
- Weight: 1 (about page), 1 (trust signals)
- Status: warn if missing (not fail, since some businesses legitimately skip this)

**Estimated effort:** Small-medium. Link scanning is straightforward. Trust signal detection is heuristic-based.

#### 2.2 Enhanced structured data validation (upgrade existing SEO check)

**What:** Go beyond "structured data exists" to "structured data is valid and useful."

**Why:** Many aging sites have broken or incomplete JSON-LD copied from a tutorial in 2018. Checking that LocalBusiness schema has name, address, and telephone tells a much better story than just "structured data found."

**Implementation:**
- Upgrade `checkStructuredData()` in `checks/seo-dom.ts`
- Parse JSON-LD content and validate required properties per @type:
  - LocalBusiness: name, address, telephone (very relevant for Swedish SMBs)
  - Organization: name, url, logo
  - Article: headline, datePublished, author
  - Product: name, offers
- Weight: stays at 1, but now produces more specific pass/warn/fail signals
- Items: list of missing required properties per schema type

**Estimated effort:** Medium. JSON-LD parsing and per-type validation logic.

#### 2.3 URL structure check (add to Website Quality)

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

### Priority 3: Nice to have, lower urgency

#### 3.1 Local SEO signals

**What:** Check for hreflang tags, geo meta tags, and LocalBusiness structured data presence.

**Why:** Relevant for Swedish local businesses. But overlaps with structured data validation (2.2) and is somewhat niche.

**Implementation:** Extend SEO DOM checks with hreflang detection and geo meta tag checks. Small effort but lower impact on the average scan.

#### 3.2 Social sharing quality

**What:** Check OG image dimensions (1200x630 recommended), OG URL matching canonical, social profile links.

**Why:** Useful but not urgent-feeling. "Your social sharing image is too small" does not drive the same urgency as "Your API keys are exposed."

**Implementation:** Extend existing OG/Twitter card checks with dimension and URL validation. Would require a HEAD request to the og:image URL to check dimensions.

#### 3.3 Form security (if forms are present)

**What:** Check if forms submit over HTTPS, check for CAPTCHA on public forms.

**Why:** Relevant but only applies to pages with forms. Many SMB homepages do not have forms.

**Implementation:** DOM query for `<form>` elements, check action URLs. Small effort but conditional applicability.

## Implementation approach

### Architecture: no new tracks needed

All Priority 1 and 2 checks fit into the existing three-track architecture:

- **Leaked secrets, broken links, image checks, heading structure, content basics, trust signals, URL structure** all run in the DOM track via Playwright
- **Enhanced structured data** runs in the existing SEO DOM sub-track
- No new Inngest steps, no new browser instances, no new external dependencies

The DOM track already runs 4 sub-checks in parallel via `Promise.allSettled()`. The new checks either:
1. Get added to existing sub-check functions (heading structure into standards, trust signals into legal)
2. Get added as new entries in the parallel array (broken links, image checks, secrets)

### Timing budget

Current scan: ~15-20 seconds. The DOM track runs in parallel with Lighthouse and headers, so DOM check time is currently hidden behind Lighthouse's ~10-15 second runtime.

**Checks with no HTTP overhead** (add ~0ms to DOM track):
- Heading structure
- Content basics
- URL structure
- Leaked secrets (page content already loaded)

**Checks with HTTP overhead** (need timeout management):
- Broken links: cap at 50 links, 5s per request, 15s total budget, parallel
- Image file sizes: cap at 10 largest images, 5s per request, parallel with links
- About page detection: 1 HEAD request
- Structured data validation: no extra requests (parse existing JSON-LD)

Worst case for HTTP-based checks: 15 seconds if external sites are slow. This runs in parallel with Lighthouse, so it should not extend total scan time unless Lighthouse finishes unusually fast.

**Safeguard:** Wrap all HTTP-based checks in `Promise.race()` with a 15-second category-level timeout. If links/images are still being checked when the timeout hits, return partial results with a "some links could not be checked" diagnostic.

### File changes

**Renamed/modified files:**
- `checks/standards.ts` - rename internal references, add 5 new checks (broken links, images, headings, content, URL)
- `checks/legal.ts` - add about page and trust signal checks
- `checks/seo-dom.ts` - upgrade structured data validation
- `checks/security-headers.ts` or new `checks/secrets.ts` - add leaked secrets scan
- `scanner/dom-checks.ts` - add new check to parallel array if creating separate file
- `scanner/aggregate.ts` - update category names in aggregation (if renaming)
- `packages/shared/src/scan/categories.ts` - rename category keys if changing names
- `packages/shared/src/scan/results.ts` - no schema changes needed (CheckResult is flexible enough)

**Frontend changes (not in scope for this plan but will be needed):**
- Category display names
- Possibly new icons for renamed categories
- Updated descriptions/helper text

### Rollout order

**Phase 1: New checks, no renaming**
Add all Priority 1 checks to existing categories with existing names. This is pure backend work with no frontend changes needed (new CheckResults appear automatically in results).

1. Leaked secrets scan (Security)
2. Heading structure (Standards)
3. Content basics (Standards)
4. URL structure (Standards)
5. Broken links (Standards)
6. Image issues (Standards)

**Phase 2: Category enrichment**
Add Priority 2 checks:

1. About page + trust signals (Legal)
2. Enhanced structured data validation (SEO)
3. URL structure (Standards)

**Phase 3: Rename and reframe**
Coordinate frontend + backend rename:

1. "Modern Web Standards" becomes "Website Quality"
2. "EU Legal Compliance" becomes "Trust & Compliance"
3. Update scoring descriptions and helper text
4. Update docs and marketing copy

## What we are explicitly not doing

- **Multi-page crawling.** Our scan is a single-page snapshot. Squirrelscan's strength in finding cross-page issues (orphan pages, duplicate titles, sitemap coverage) requires a fundamentally different architecture and would blow our 15-20 second time budget.
- **AI content detection.** Politically risky for a sales tool. We do not want to insult prospects.
- **Analytics tracking detection.** "You don't have Google Analytics" is not a finding that drives urgency.
- **Adblock detection.** Irrelevant for our audience.
- **Adding new categories.** Staying at 6 categories keeps the scorecard clean and avoids database schema changes. Enrich, don't expand.

## Open questions

1. **Broken links timeout budget.** How aggressive should we be? 50 links with 5s timeout each could take up to 15 seconds in serial. With 10 concurrent requests, ~7.5 seconds worst case. Is that acceptable if it runs in parallel with Lighthouse?

2. **Leaked secrets: false positive risk.** Google Maps API keys in frontend code are intentional (they are restricted by HTTP referrer). Should we still flag them as "exposed" with a nuance in the description, or skip known-frontend patterns?

3. **Category renaming: timing.** Should we rename categories before or after adding new checks? Renaming first makes the categories feel empty. Adding checks first means a brief period where "Modern Web Standards" contains link and image checks, which is semantically odd.

4. **Image dimension checking.** Getting actual file sizes requires HEAD requests. Getting rendered dimensions vs natural dimensions can be done via `page.evaluate()`. Should we check both, or just the DOM-available information?

5. **Trust signals: what counts?** Review widgets (Google, Trustpilot), certification badges, social media links, testimonials. How broad should we cast the net? False negatives (missing a trust signal we should have caught) are less harmful than false positives (flagging something that is not a trust signal).
