# Free Website Scan

The Free Website Scan is Vivotiv's pre-launch lead magnet and sales tool.
It scans any public website URL and returns a clear scorecard across six business-critical areas:

- Performance and speed
- SEO
- Accessibility
- Trust and security
- Website quality
- AI readiness

The goal is simple: show real issues quickly, explain why they matter, and create a natural next step toward a modern rebuild.

## What users experience

1. Visitor lands on the landing page
2. Enters website URL and email
3. Scan request is accepted immediately
4. Background scan runs in parallel tracks
5. Results page shows category scores, issue highlights, and clear CTA

Typical scan time is 15 to 30 seconds depending on target site behavior and broken link checking.

## Technology stack

The scan pipeline combines six parallel tracks:

- **Lighthouse** for performance, SEO, and browser best-practices signals
- **Playwright + axe-core** for DOM-level checks, accessibility, trust and security, standards analysis, and AI readiness DOM checks
- **HTTP/TLS header inspection** for security headers and SSL/TLS status
- **External API checks** using MDN HTTP Observatory, Google Web Risk API, and W3C Nu HTML Checker for security grading, threat detection, and HTML validation
- **Link checking** via linkinator for broken link detection
- **AI readiness HTTP checks** for robots.txt AI crawler analysis, llms.txt detection, and content renderability (SSR) comparison

Job orchestration is handled by **Inngest**, with execution in the `apps/jobs` service.

## What we check

### 1) Performance and speed

Focuses on real loading and rendering quality signals, including Core Web Vitals and related diagnostics from Lighthouse.

Examples:
- Largest Contentful Paint (LCP), Total Blocking Time (TBT), Cumulative Layout Shift (CLS), First Contentful Paint (FCP), Speed Index (SI), Time to First Byte (TTFB)
- Render-blocking resources
- Page weight and optimization opportunities

### 2) SEO

Combines Lighthouse SEO audits with DOM-level SEO checks.

Examples:
- Meta, canonical, viewport, crawlability signals
- `robots.txt` and `sitemap.xml`
- Structured data (JSON-LD, Microdata, RDFa)
- Open Graph and Twitter Card coverage

### 3) Accessibility

Uses axe-core with WCAG 2.x A/AA tags and evaluates both desktop and mobile viewport contexts.

Examples:
- Critical, serious, moderate, and minor violations
- Incomplete findings surfaced as manual-review diagnostics

### 4) Trust and security

Combines GDPR/ePrivacy compliance checks, server security analysis, and external security APIs into a single category. The scan results UI groups checks into two labeled subsections for readability.

**Trust and compliance subsection:**
- Cookie banner and reject option presence
- Pre-consent tracking script behavior
- Pre-consent tracking cookie detection
- Privacy and cookie policy discoverability
- Contact/business identification signals
- About page / om-oss page discoverability
- SSL/TLS trust and certificate status

**Security subsection:**
- CSP quality and permissive policy warnings
- HSTS quality (`max-age`, `includeSubDomains`)
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Server and technology exposure headers
- MDN HTTP Observatory grade (A+ to F security header assessment)
- Google Web Risk threat detection (malware, social engineering, unwanted software)

Internal key: `trustSecurity`. Each check carries a `subsection` field (`"trust"` or `"security"`) so the UI can group them under the correct heading.

### 5) Website quality

Assesses whether the site is built and maintained properly through markup analysis, link validation, and content signals.

Examples:
- Broken link detection across all page links
- Heading structure (H1 count, level hierarchy, empty headings)
- Content quality (word count, lang attribute)
- URL hygiene (uppercase, underscores, excessive parameters)
- Responsive viewport setup
- W3C HTML validation (errors, warnings, spec violations)
- Favicon presence
- Third-party resource footprint

### 6) AI readiness

Analyzes how well a site is prepared for AI-powered search engines and AI agents. This is a site-analysis category only. We scan the page with Playwright, fetch robots.txt and llms.txt, and inspect the DOM. We do not send prompts to AI models to check if the business is mentioned.

**AI Crawler Access:**
Parses robots.txt and checks how the site handles AI crawlers across three tiers: training crawlers (GPTBot, ClaudeBot, Google-Extended, Bytespider, CCBot, Applebot-Extended, meta-externalagent, Amazonbot), search/index crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot), and user-initiated fetchers (ChatGPT-User, Claude-User, Perplexity-User). Blocking search crawlers means the site is invisible to AI search results. Blocking training crawlers is a valid choice and does not penalize the score.

**llms.txt:**
Checks if `/llms.txt` exists and follows the specification (Markdown format, H1 with site name, H2-delimited sections). An emerging standard adopted by 844,000+ sites. Missing llms.txt triggers a warning, not a failure, since no major AI platform has confirmed reading it yet.

**Structured Data Completeness (AI lens):**
Goes beyond the SEO check ("does JSON-LD exist?") to evaluate whether structured data is complete enough for an AI to identify the business. Checks for Organization/LocalBusiness schema with name, url, description, logo, and sameAs links. Evaluates entity cross-referencing via `@id` and `@graph`, and verifies schema content matches visible page content.

**Content Renderability (SSR check):**
Fetches the page with a plain HTTP GET (no JavaScript) and compares the raw HTML text content against the Playwright-rendered content. AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not execute JavaScript. If content requires JS to render, it is invisible to every AI crawler. Scoring: 90%+ match is a pass, 50-89% is a warning, below 50% is a failure.

**Semantic HTML:**
Checks whether the page uses semantic HTML elements (`<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`) that help AI distinguish primary content from navigation and chrome. Measures semantic elements vs total `<div>` elements as a ratio signal.

**Entity Clarity:**
Checks whether an AI can identify the business name, location, and offering from the page's title, meta description, Open Graph tags, structured data, and `<h1>`. Evaluates consistency across these sources. Contradictory information reduces trust weight in AI knowledge graphs.

**Citation Readiness:**
Checks for content patterns that correlate with higher AI citation rates: data tables, lists in content areas, statistics and figures, FAQ-pattern content, and self-contained sections (heading followed by 80-250 words). Pages with data tables earn significantly more AI citations. Three or more citation-friendly patterns is a pass.

## Scoring model

Each category is scored from 0 to 100.

### Two scoring models

#### Checklist-based categories

Trust and security, SEO, performance, AI readiness, and website quality use a fixed checklist model:

- A fixed set of checks runs every scan
- Each check returns pass, warn, or fail
- The category score is a weighted average of check scores
- Users see the full check list regardless of outcome

#### Deduction-based category (accessibility)

Accessibility uses axe-core and follows a deduction model:

- The score starts at 100
- Points are deducted per violation by severity
- axe-core reports violations and incomplete findings, not a full pass list for every rule

Current deduction values:

- Critical: -15 points (capped at 5 node multiplier)
- Serious: -10 points
- Moderate: -5 points
- Minor: -2 points

Traffic lights:

- **Red**: 0 to 49
- **Orange**: 50 to 89
- **Green**: 90 to 100

Overall score is a weighted average:

- Performance: 20%
- SEO: 20%
- Accessibility: 20%
- Trust and security: 20%
- Website quality: 10%
- AI readiness: 10%

### Result display behavior

Because accessibility is deduction-based, it can show fewer visible items than checklist-based categories.

- Checklist categories often show 8 to 10 checks
- Accessibility can show 1 to 2 findings on a healthy site

This can make accessibility results look thinner even when the category score is high.

Current UX direction:

- Show an accessibility summary line (rules evaluated and issues found)
- Surface pass counts alongside violations where possible
- Add contextual helper text when only a few findings are present

### Overlap management with existing categories

Several AI readiness checks touch areas that other categories also check. Each category checks through its own lens:

| Signal | Existing category check | AI readiness check |
|---|---|---|
| Structured data | SEO: "Does JSON-LD exist? Are there meta tags?" | AI readiness: "Is the schema complete enough for an AI to identify the business?" |
| Heading structure | Website quality: "Is the heading hierarchy valid?" | AI readiness does not re-check heading structure |
| Content length | Website quality: "Does the page have enough content?" | AI readiness: "Are sections self-contained and citable?" (different question) |
| Meta tags | SEO: "Are title/description/OG present?" | AI readiness: "Are they consistent with each other and with schema?" (entity clarity) |
| robots.txt | SEO: "Is robots.txt present and not blocking Googlebot?" | AI readiness: "Are AI-specific crawlers allowed or blocked?" |

### Threshold calibration

Several AI readiness scoring thresholds are educated guesses (SSR 90/50 split, citation readiness pattern counts, semantic HTML criteria). These must be tested against 20-30 real Swedish SMB sites during implementation and adjusted based on observed score distributions. The goal is that a typical aging SMB site scores orange (50-89).

## Reliability and safety principles

The scan is designed to be trustworthy even on unstable targets:

- Six parallel tracks with failure isolation
- Partial-result support when any track fails
- External API failures (Observatory, Web Risk, W3C Validator) are silently skipped with Sentry logging
- AI readiness HTTP fetches wrapped in 5-second timeouts, failures treated as "could not check" rather than scan errors
- Broken link checking returns partial results on timeout (30s cap)
- Explicit error diagnostics in affected categories
- DNS and redirect-chain validation against private/local IP targets
- Request and runtime timeouts to avoid hanging scans

Current platform note:

- On Railway, Chromium sandbox startup caused Lighthouse connection failures (`ECONNREFUSED` to local DevTools port).
- The jobs service currently runs Chromium with `--no-sandbox` for compatibility.
- Revisit sandbox mode when the runtime supports stable sandbox startup.

## Why this matters for the business

This is not just a technical audit. It is a sales conversation starter.

- It makes quality gaps visible in a few seconds
- It translates technical debt into business risk
- It gives prospects a concrete reason to modernize
- It creates a clean handoff to Vivotiv's rebuild offer
