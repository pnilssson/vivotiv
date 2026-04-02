# Scan Improvements Plan

Working document for adding AI Readiness as a scan category and merging Security into Trust & Compliance.

## Context

Our scan targets Swedish SMBs with aging websites. It runs a single-page scan in 15-30 seconds and returns a scorecard designed to start a sales conversation. Every addition must pass this filter: **does this finding make a business owner think "I need to fix this"?**

AI-powered search (ChatGPT, Perplexity, Gemini, Google AI Overviews) is growing fast. Traditional search volume is projected to drop 25% by 2026. Swedish SMBs that are invisible to AI search engines will lose ground to competitors who are. This is a real, emerging business risk worth surfacing in the scan.

## Two changes

### 1. Merge Security into Trust & Compliance

Rename the combined category to **Trust & Security**. A business owner does not distinguish between "your site has no cookie banner" and "your site has no security headers." Both mean the same thing: this site does not feel safe or trustworthy. The categories already share SSL/TLS as a check.

### 2. Add AI Readiness as the sixth category

AI Readiness analyzes how well a site is prepared for AI-powered search engines and AI agents. This is a site-analysis category only -- we scan the page with Playwright, fetch robots.txt and llms.txt, and inspect the DOM. We do NOT send prompts to AI models to check if the business is mentioned (that is a future premium feature: AI Visibility Check).

## New category structure

| Category | Weight | Tier |
|---|---|---|
| Performance | 20% | Core |
| SEO | 20% | Core |
| Accessibility | 20% | Core |
| Trust & Security | 20% | Core |
| Website Quality | 10% | Supporting |
| AI Readiness | 10% | Supporting |

Same 4x20% + 2x10% structure as before. Same 2x3 grid layout.

## Trust & Security: merged category

Combines all checks from the current Trust & Compliance and Security categories. No checks are removed.

### From Trust & Compliance (unchanged)

- Cookie banner and reject option presence
- Pre-consent tracking script behavior
- Pre-consent tracking cookie detection
- Privacy and cookie policy discoverability
- Contact/business identification signals
- About page / om-oss page discoverability
- SSL/TLS trust and certificate status

### From Security (moved in)

- CSP quality and permissive policy warnings
- HSTS quality (`max-age`, `includeSubDomains`)
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Server and technology exposure headers
- MDN HTTP Observatory grade (A+ to F)
- Google Web Risk threat detection (malware, social engineering, unwanted software)

### Implementation notes

- Rename category key across all projects (web, API, jobs, shared package, database seeds, email templates, marketing copy)
- Merge check results from both old categories into the single new category in the aggregation layer
- No checks are added or removed -- this is purely a structural merge
- The combined category will have more checks than any other single category, which is fine -- it makes the category substantial

## AI Readiness: new category

### What it checks

#### 1. AI Crawler Access

**What:** Parse robots.txt and check how the site handles AI crawlers. AI companies operate three-tier bot systems: training crawlers (collect data for model training), search/index crawlers (power AI search results), and user-initiated fetchers (real-time retrieval when a user asks an AI to browse).

**Why:** Blocking search crawlers means you never appear in AI search results. Many sites unknowingly block all AI bots, or have a wildcard `Allow: /` without understanding the distinction. "Your site blocks AI search engines from finding you" is an immediate wake-up call.

**Bots to check (minimum viable set):**

Training crawlers:
- `GPTBot` (OpenAI)
- `ClaudeBot` (Anthropic)
- `Google-Extended` (Google/Gemini)
- `Bytespider` (ByteDance)
- `CCBot` (Common Crawl)
- `Applebot-Extended` (Apple)
- `meta-externalagent` (Meta)
- `Amazonbot` (Amazon)

Search/index crawlers:
- `OAI-SearchBot` (OpenAI/ChatGPT search)
- `Claude-SearchBot` (Anthropic/Claude search)
- `PerplexityBot` (Perplexity)

User-initiated fetchers:
- `ChatGPT-User` (OpenAI)
- `Claude-User` (Anthropic)
- `Perplexity-User` (Perplexity)

**Implementation:**
- Fetch `/robots.txt` via HTTP (already available in the pipeline, or add a lightweight fetch)
- Parse rules per user-agent using a robots.txt parser
- Determine effective access for each bot category
- Report: which bot categories are allowed, which are blocked, whether the site has made an explicit choice or is relying on a wildcard

**Scoring logic:**
- Pass: Search crawlers are explicitly or implicitly allowed
- Warn: No explicit AI bot rules (wildcard only -- site owner likely has not considered this)
- Fail: Search crawlers are blocked (site is invisible to AI search)
- Note: Blocking training crawlers is a valid choice and should not penalize the score

**Weight:** 2

**Estimated effort:** Small. HTTP fetch + robots.txt parsing. No browser needed.

#### 2. llms.txt

**What:** Check if `/llms.txt` exists and follows the specification.

**Why:** llms.txt is an emerging standard (844,000+ sites adopted, including Anthropic, Cloudflare, Stripe) that provides a structured Markdown summary of the site for LLM consumption. No major AI platform has confirmed they read it yet, but adoption is growing and the implementation cost is near-zero. "Your competitors are already making their sites AI-friendly" creates urgency.

**Spec (from llmstxt.org):**
- Served at `/llms.txt`
- Markdown format
- H1 with site/project name (required)
- Optional blockquote with essential context
- H2-delimited sections with markdown link lists
- UTF-8, `text/plain` or `text/markdown` MIME type
- HTTPS, returns HTTP 200, no auth

**Implementation:**
- HTTP GET `/llms.txt`
- Check HTTP status (200 = exists)
- If exists: validate Markdown structure (H1 present, parseable)
- Also check for `/llms-full.txt` variant (bonus, not required)

**Scoring logic:**
- Pass: llms.txt exists with valid structure
- Warn: llms.txt missing (most sites do not have this yet, so warn not fail)
- Bonus note if llms-full.txt also exists

**Weight:** 1

**Estimated effort:** Small. Single HTTP fetch + basic Markdown parsing.

#### 3. Structured Data Completeness (AI lens)

**What:** Assess whether the structured data is complete enough for an AI to identify what the business is, where it operates, and what it offers. This goes beyond the existing SEO check ("does JSON-LD exist?") to evaluate depth and quality.

**Why:** Google and Bing confirmed (2025) they use schema markup for AI Overviews and Copilot. The mechanism is indirect: schema helps search engines build entity understanding, and AI models query those indexes. Incomplete or shallow schema means the AI has less to work with. "An AI cannot tell what your business does from your website's data" is concrete and actionable.

**What to check:**
- Organization/LocalBusiness schema present with: `name`, `url`, `description`, `logo`, `sameAs` (links to LinkedIn, social profiles, directories)
- If FAQ content exists on the page: FAQPage schema present with proper Question/Answer pairs
- If service/product content exists: relevant schema types present
- Entity cross-referencing: `@id` values used, `@graph` structure connecting entities
- Schema content matches visible page content (no hidden-only schema)

**Implementation:**
- Parse all `<script type="application/ld+json">` blocks from the DOM
- Validate JSON structure
- Check for Organization/LocalBusiness with required properties
- Check for `sameAs` array with external links
- Check for `@id` and `@graph` usage
- Compare schema `name` against `<title>` and `<h1>` for consistency

**Scoring logic:**
- Pass: Organization schema present with name, url, description, sameAs, and entities connected via @id
- Warn: Schema exists but incomplete (missing sameAs, missing description, no @id cross-references)
- Fail: No business-identifying schema at all

**Weight:** 2

**Estimated effort:** Medium. DOM parsing + JSON validation + cross-reference checking. No external requests.

#### 4. Content Renderability (SSR check)

**What:** Check whether critical content is present in the raw HTML without JavaScript execution.

**Why:** GPTBot, ClaudeBot, and PerplexityBot do NOT execute JavaScript. If content requires JS to render, it is invisible to every AI crawler. This is described in the research as "the single most important technical gate" for AI discoverability. Very common issue on modern SPA/React sites. "AI search engines cannot see your website's content" is devastating.

**Implementation:**
- Fetch the page URL with a simple HTTP GET (no browser, no JS)
- Extract text content from the raw HTML
- Compare against the Playwright-rendered content (which we already have)
- Calculate a content match ratio: what percentage of the rendered text is present in the raw HTML?

**Scoring logic:**
- Pass: 90%+ of visible text content present in raw HTML
- Warn: 50-89% present (partial SSR, some JS-dependent content)
- Fail: <50% present (content is primarily client-side rendered)

**Weight:** 2

**Estimated effort:** Medium. Requires an additional HTTP fetch (lightweight, no browser) and text comparison logic.

#### 5. Semantic HTML

**What:** Check whether the page uses semantic HTML elements that help AI distinguish primary content from navigation, sidebars, and chrome.

**Why:** Without semantic tags, AI crawlers must parse hundreds of nested `<div>` tags to find the actual content. `<main>`, `<article>`, `<section>` provide clear signals about content hierarchy. Most aging SMB sites are built with div soup. "AI cannot tell your main content apart from your navigation" is a clear problem statement.

**Implementation:**
- `page.evaluate()` to check for presence of:
  - `<main>` (exactly one expected)
  - `<article>` (expected on content pages)
  - `<section>` (expected for distinct content areas)
  - `<nav>` (expected for navigation)
  - `<header>` and `<footer>`
- Count semantic elements vs total `<div>` elements as a ratio signal

**Scoring logic:**
- Pass: `<main>` present + at least 2 other semantic elements used
- Warn: Some semantic elements but missing `<main>` or relying heavily on divs
- Fail: No semantic HTML at all (pure div/span structure)

**Weight:** 1

**Estimated effort:** Small. Pure DOM query via `page.evaluate()`.

#### 6. Entity Clarity

**What:** Can an AI quickly identify the business name, location, and offering from the page's title, meta description, and structured data? Are these sources consistent with each other?

**Why:** AI systems cross-reference entities against knowledge graphs (Wikidata, Google Knowledge Graph). Contradictory information across title, meta, and schema reduces trust weight. For a Swedish SMB, "AI cannot confidently identify what your business is called or what you do" hits close to home.

**Implementation:**
- Extract business identity signals from:
  - `<title>` tag
  - `<meta name="description">`
  - `og:title` and `og:description`
  - Organization/LocalBusiness schema `name` and `description`
  - `<h1>` content
- Check for:
  - Entity name consistency across sources (title, OG, schema)
  - Description present and substantive (not empty, not generic)
  - `og:title` aligned with `<title>` and `<h1>`

**Scoring logic:**
- Pass: Business name identifiable and consistent across title, schema, and OG. Description present in meta and schema.
- Warn: Partial consistency (name in some sources but not others, or description missing in schema)
- Fail: Cannot identify a consistent business entity from the page signals

**Weight:** 1

**Estimated effort:** Medium. Multiple DOM extractions + cross-comparison logic.

#### 7. Citation Readiness

**What:** Does the page contain content that AI models have a reason to reference? This checks for structural patterns that correlate with higher AI citation rates: answer-first paragraphs, lists/tables, statistics, and self-contained sections.

**Why:** Pages with data tables earn 4.1x more AI citations. Content with statistics gets 30-40% higher visibility. Answer-first positioning (direct answer in first 40-60 words of a section) gets cited 67% more. "Your content is not structured in a way that AI search engines can quote" connects to the business outcome.

**Implementation:**
- `page.evaluate()` to check for:
  - Presence of `<table>` elements (comparison/data tables)
  - Presence of `<ol>` / `<ul>` lists in content area (not navigation)
  - Statistics/numbers in content (regex for percentages, currency amounts, specific figures)
  - FAQ-pattern content (Q&A format, whether or not it has FAQ schema)
  - Self-contained sections: heading followed by 80-250 words of content
- This is a heuristic check -- it measures structural patterns, not content quality

**Scoring logic:**
- Pass: 3+ citation-friendly patterns present (tables, lists, statistics, FAQ sections, self-contained sections)
- Warn: 1-2 patterns present
- Fail: No citation-friendly content patterns found

**Weight:** 1

**Estimated effort:** Medium. Multiple DOM queries + content analysis via `page.evaluate()`.

## Implementation approach

### Architecture

AI Readiness checks split across existing and new tracks:

**DOM track additions** (run in existing Playwright context):
- Structured data completeness (check 3)
- Semantic HTML (check 5)
- Entity clarity (check 6)
- Citation readiness (check 7)

**New lightweight HTTP track:**
- AI Crawler Access: fetch and parse `/robots.txt` (check 1)
- llms.txt: fetch `/llms.txt` and optionally `/llms-full.txt` (check 2)
- Content renderability: fetch page URL without JS, compare to Playwright content (check 4)

The HTTP track runs in parallel with all other tracks. Each fetch wrapped in a 5-second timeout. Failures treated as "could not check" rather than scan errors.

### Timing budget

**Checks with no HTTP overhead** (add ~0ms to DOM track):
- Structured data completeness
- Semantic HTML
- Entity clarity
- Citation readiness

**HTTP fetches** (run in parallel, new track):
- robots.txt: <1 second
- llms.txt: <1 second
- Raw HTML fetch for SSR check: 1-3 seconds

All AI Readiness checks fit within the existing scan time budget. No extension to the 15-30 second window needed.

### File changes

**Modified files:**
- Category definitions in shared package: merge Security + Trust & Compliance into Trust & Security, add AI Readiness
- Aggregation logic: merge old category keys, add new category
- DOM checks runner: add new AI Readiness DOM checks
- Frontend: update category display names, add AI Readiness card/section
- Database seeds: update category entries
- Email templates: update category references
- Marketing copy: update category names

**New files:**
- `checks/ai-readiness/crawler-access.ts` -- robots.txt parsing for AI bots
- `checks/ai-readiness/llms-txt.ts` -- llms.txt detection and validation
- `checks/ai-readiness/structured-data-completeness.ts` -- schema depth analysis
- `checks/ai-readiness/content-renderability.ts` -- SSR detection
- `checks/ai-readiness/semantic-html.ts` -- semantic element analysis
- `checks/ai-readiness/entity-clarity.ts` -- cross-source entity consistency
- `checks/ai-readiness/citation-readiness.ts` -- citation pattern detection
- `scanner/ai-readiness-checks.ts` -- track runner for AI Readiness

### Rollout order

**Phase 1: Category merge (ship first, independently)**

1. Merge Security into Trust & Compliance, rename to Trust & Security
2. Update across all projects (shared package, API, jobs, web, database, emails, marketing)
3. Verify scoring works correctly with merged category

**Phase 2: AI Readiness category (ship together)**

1. AI Crawler Access (robots.txt parsing)
2. llms.txt detection
3. Structured Data Completeness
4. Content Renderability (SSR check)
5. Semantic HTML
6. Entity Clarity
7. Citation Readiness

## Overlap management with existing categories

Several AI Readiness checks touch areas that other categories also check. The key principle: **each category checks through its own lens**.

| Signal | Existing category check | AI Readiness check |
|---|---|---|
| Structured data | SEO: "Does JSON-LD exist? Are there meta tags?" | AI Readiness: "Is the schema complete enough for an AI to identify the business?" |
| Heading structure | Website Quality: "Is the heading hierarchy valid?" | AI Readiness does NOT re-check heading structure |
| Content length | Website Quality: "Does the page have enough content?" | AI Readiness: "Are sections self-contained and citable?" (different question) |
| Meta tags | SEO: "Are title/description/OG present?" | AI Readiness: "Are they consistent with each other and with schema?" (entity clarity) |
| robots.txt | SEO: "Is robots.txt present and not blocking Googlebot?" | AI Readiness: "Are AI-specific crawlers allowed or blocked?" |

## Threshold calibration

Several scoring thresholds are educated guesses based on research (SSR 90/50 split, citation readiness pattern counts, semantic HTML pass/warn/fail criteria). These must be tested against 20-30 real Swedish SMB sites during implementation and adjusted based on observed score distributions. The goal is that a typical aging SMB site scores orange (50-89), not that everything fails or everything passes.

## Future: AI Visibility Check

The AI Readiness category analyzes the site itself. A future premium feature -- AI Visibility Check -- will send prompts to AI models (ChatGPT, Perplexity, Gemini) to check if the business is actually mentioned in AI responses. When designing the data model for AI Readiness results, keep a clear separation so AI Visibility Check data can be added alongside it without restructuring.

## Decisions log

| Decision | Rationale |
|---|---|
| Merge Security into Trust & Compliance | Business owner does not distinguish these. Keeps 6 categories for clean 2x3 grid. Makes room for AI Readiness without adding a 7th category. |
| AI Readiness at 10% weight | Forward-looking category. Important but not yet an immediate business risk like performance, SEO, accessibility, or trust/compliance. Same tier as Website Quality. |
| No AI Visibility Check (prompt-based) | Sending prompts to AI models to check if a business is mentioned is a future premium feature. The current scan is site-analysis only via Playwright. |
| llms.txt as warn-not-fail | 844k+ sites have adopted it but no AI platform has confirmed reading it. Penalizing absence too harshly would be premature. |
| Blocking training crawlers is not penalized | Blocking GPTBot/ClaudeBot for training is a valid business choice. Only blocking search crawlers (OAI-SearchBot, PerplexityBot) affects the score negatively. |
| Content renderability via raw HTML fetch | Separate HTTP GET without browser is the most reliable way to see what AI crawlers see. Comparing against Playwright output gives a clear delta. |

## Research sources

Key sources that informed the check design:

- Cloudflare: From Googlebot to GPTBot (2025) -- crawler landscape
- SearchAtlas: The Limits of Schema Markup for AI Search (Dec 2024) -- no standalone correlation between schema and citations
- Google and Bing: confirmed schema use in AI Overviews/Copilot (early 2025)
- SearchVIU: Schema Markup and AI in 2025 -- AI models do not parse JSON-LD directly, mechanism is indirect via search indexes
- JetOctopus: 2026 Technical SEO Playbook for AI Crawlers -- AI bot timeouts, SSR importance
- llmstxt.org: llms.txt specification
- Search Engine Land: Technical SEO for Generative Search (2025)
- GenOptima: GEO Best Practices 2026 Playbook -- citation patterns and content structure
- Discovered Labs: How AI Systems Decide What to Cite -- metadata priority order
- OpenAI, Anthropic, Perplexity, Google, Apple, Amazon, Meta: official crawler documentation
- ai-robots-txt GitHub: community-maintained crawler list (140+ entries)
