# Scan vs Google Lighthouse

Internal reference for understanding what the Vivotiv scan does beyond a standard Lighthouse run, and where the real differentiation lies.

## What Lighthouse covers

Lighthouse provides three of our six categories, partially:

- **Performance**: Core Web Vitals (LCP, TBT, CLS, FCP, SI), render-blocking resources, page weight
- **SEO basics**: Meta tags, viewport, crawlability signals
- **Best practices**: General browser hygiene, some security surface

## What we add on top

### EU Legal Compliance (Lighthouse does none of this)

This is the strongest differentiator. The entire category is absent from Lighthouse.

- Cookie banner detection across 15+ known CMP implementations, including shadow DOM
- Reject button presence and symmetry check
- Pre-consent tracking script detection (scripts firing before user consent)
- Pre-consent tracking cookie detection
- Privacy policy and cookie policy link discoverability
- Business contact and identification signals (including Swedish org numbers)
- SSL/TLS trust and certificate status

### Accessibility (significantly deeper than Lighthouse)

- Full axe-core analysis with WCAG 2.x A/AA tags
- Runs across both desktop and mobile viewports (Lighthouse runs one)
- Violation severity categorization (critical, serious, moderate, minor)
- Incomplete findings surfaced as manual-review diagnostics

### SEO (extends Lighthouse with DOM-level checks)

- `robots.txt` and `sitemap.xml` validation
- Structured data detection (JSON-LD, Microdata, RDFa)
- Open Graph tag coverage
- Twitter Card coverage

### Security (much deeper than Lighthouse best-practices)

- Content-Security-Policy quality and permissive policy warnings
- HSTS quality (`max-age`, `includeSubDomains`)
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Server and technology exposure header detection
- TLS certificate inspection: protocol version, authorization status, days until expiry

### Modern Web Standards

- Deprecated HTML element detection
- Third-party resource footprint analysis
- Responsive viewport and favicon checks

**Note:** PageSpeed Insights (pagespeed.web.dev) is Lighthouse running in the cloud with optional Chrome field data. The same gaps apply. All differentiation listed above holds equally against PageSpeed Insights.

## Where we repackage Lighthouse without adding much

Performance is essentially Lighthouse numbers scored through our model. If someone already runs Lighthouse in DevTools, this category alone does not justify the scan.

## The real value proposition

1. **EU Legal Compliance** is the category no one gets from Lighthouse, and it is where fines come from. For Swedish/EU businesses, this is the most actionable category.

2. **The unified scorecard.** Lighthouse produces four technical scores for developers. Our scan produces six business-relevant categories with a weighted overall score and plain-language descriptions. A business owner can read our report. They cannot read a Lighthouse JSON output.

3. **Accessibility depth.** axe-core across two viewports with severity classification is meaningfully better than what Lighthouse runs. With the EU Accessibility Act in effect since June 2025, this matters.

4. **One scan, not five tools.** Getting the equivalent coverage without our scan means running Lighthouse, axe-core, a security header checker, a TLS inspector, and manual GDPR checks separately. Our audience does not do this.
