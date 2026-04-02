# Free Website Scan

The Free Website Scan is Vivotiv's pre-launch lead magnet and sales tool.
It scans any public website URL and returns a clear scorecard across six business-critical areas:

- Performance and speed
- SEO
- Accessibility
- Trust and compliance
- Security
- Website quality

The goal is simple: show real issues quickly, explain why they matter, and create a natural next step toward a modern rebuild.

## What users experience

1. Visitor lands on the landing page
2. Enters website URL and email
3. Scan request is accepted immediately
4. Background scan runs in parallel tracks
5. Results page shows category scores, issue highlights, and clear CTA

Typical scan time is 15 to 30 seconds depending on target site behavior and broken link checking.

## Technology stack

The scan pipeline combines five parallel tracks:

- **Lighthouse** for performance, SEO, and browser best-practices signals
- **Playwright + axe-core** for DOM-level checks, accessibility, legal, and standards analysis
- **HTTP/TLS header inspection** for security headers and SSL/TLS status
- **External API checks** using MDN HTTP Observatory, Google Web Risk API, and W3C Nu HTML Checker for security grading, threat detection, and HTML validation
- **Link checking** via linkinator for broken link detection

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

### 4) Trust and compliance

Checks common GDPR/ePrivacy implementation patterns from the rendered page and network behavior.

Examples:
- Cookie banner and reject option presence
- Pre-consent tracking script behavior
- Pre-consent tracking cookie detection
- Privacy and cookie policy discoverability
- Contact/business identification signals
- About page / om-oss page discoverability
- SSL/TLS trust and certificate status

### 5) Security

Combines browser best-practices findings, server header analysis, and external security APIs.

Examples:
- CSP quality and permissive policy warnings
- HSTS quality (`max-age`, `includeSubDomains`)
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Server and technology exposure headers
- MDN HTTP Observatory grade (A+ to F security header assessment)
- Google Web Risk threat detection (malware, social engineering, unwanted software)

### 6) Website quality

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

## Scoring model

Each category is scored from 0 to 100.

### Two scoring models

#### Checklist-based categories

Trust and compliance, SEO, performance, security, and website quality use a fixed checklist model:

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
- Trust and compliance: 20%
- Security: 10%
- Website quality: 10%

### Result display behavior

Because accessibility is deduction-based, it can show fewer visible items than checklist-based categories.

- Checklist categories often show 8 to 10 checks
- Accessibility can show 1 to 2 findings on a healthy site

This can make accessibility results look thinner even when the category score is high.

Current UX direction:

- Show an accessibility summary line (rules evaluated and issues found)
- Surface pass counts alongside violations where possible
- Add contextual helper text when only a few findings are present

## Reliability and safety principles

The scan is designed to be trustworthy even on unstable targets:

- Five parallel tracks with failure isolation
- Partial-result support when any track fails
- External API failures (Observatory, Web Risk, W3C Validator) are silently skipped with Sentry logging
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
