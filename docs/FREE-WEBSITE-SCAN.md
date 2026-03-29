# Free Website Scan

The Free Website Scan is Vivotiv's pre-launch lead magnet and sales tool.
It scans any public website URL and returns a clear scorecard across six business-critical areas:

- Performance and speed
- SEO
- Accessibility
- EU legal compliance
- Security
- Modern web standards

The goal is simple: show real issues quickly, explain why they matter, and create a natural next step toward a modern rebuild.

## What users experience

1. Visitor lands on the landing page
2. Enters website URL and email
3. Scan request is accepted immediately
4. Background scan runs in parallel tracks
5. Results page shows category scores, issue highlights, and clear CTA

Typical scan time is around 15 to 20 seconds depending on target site behavior.

## Technology stack

The scan pipeline combines three complementary analysis approaches:

- **Lighthouse** for performance, SEO, and browser best-practices signals
- **Playwright + axe-core** for DOM-level checks, accessibility, legal, and standards analysis
- **HTTP/TLS header inspection** for security headers and SSL/TLS status

Job orchestration is handled by **Inngest**, with execution in the `apps/jobs` service.

## What we check

### 1) Performance and speed

Focuses on real loading and rendering quality signals, including Core Web Vitals and related diagnostics from Lighthouse.

Examples:
- LCP, TBT, CLS, FCP, Speed Index, TTFB
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

### 4) EU legal compliance

Checks common GDPR/ePrivacy implementation patterns from the rendered page and network behavior.

Examples:
- Cookie banner and reject option presence
- Pre-consent tracking script behavior
- Pre-consent tracking cookie detection
- Privacy and cookie policy discoverability
- Contact/business identification signals
- SSL/TLS trust and certificate status

### 5) Security

Combines browser best-practices findings with server header analysis.

Examples:
- CSP quality and permissive policy warnings
- HSTS quality (`max-age`, `includeSubDomains`)
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Server and technology exposure headers

### 6) Modern web standards

Assesses maintainability and modernization signals in page markup and external dependencies.

Examples:
- Responsive viewport setup
- Deprecated HTML usage
- Favicon presence
- Third-party resource footprint

## Scoring model

Each category is scored from 0 to 100.

Traffic lights:

- **Red**: 0 to 49
- **Orange**: 50 to 89
- **Green**: 90 to 100

Overall score is a weighted average:

- Performance: 20%
- SEO: 20%
- Accessibility: 20%
- EU legal: 20%
- Security: 10%
- Modern standards: 10%

Most categories use weighted check scoring.
Accessibility uses a deduction model based on violation severity, designed to surface severe issues clearly.

## Reliability and safety principles

The scan is designed to be trustworthy even on unstable targets:

- Parallel tracks with failure isolation
- Partial-result support when one track fails
- Explicit error diagnostics in affected categories
- DNS and redirect-chain validation against private/local IP targets
- Request and runtime timeouts to avoid hanging scans

## Why this matters for the business

This is not just a technical audit. It is a sales conversation starter.

- It makes quality gaps visible in a few seconds
- It translates technical debt into business risk
- It gives prospects a concrete reason to modernize
- It creates a clean handoff to Vivotiv's rebuild offer
