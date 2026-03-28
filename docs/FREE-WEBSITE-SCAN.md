# Free Website Scan -- Full Spec

Pre-launch lead magnet and sales tool. Scans any URL for performance, SEO, accessibility, EU legal compliance, and security -- shows a traffic-light scorecard that makes the case for a rebuild.

## 1. Purpose & Lead Gen Flow

The Free Website Scan is the first thing we build and ship -- before the full migration platform. It works as a standalone lead generation tool.

**User flow:**
```
Visitor lands on landing page
  -> Pastes their website URL
    -> Enters email to see results (gate)
      -> Scan runs (30-60 seconds, live progress bar)
        -> Results page: 6 categories, traffic-light scores
          -> CTA: "We fix all of this. Get your modern site."
            -> Feeds into waitlist / Instant Preview pipeline
```

**Why this works:**
- Costs almost nothing to run (Playwright + Lighthouse, no paid APIs)
- Every scan is a qualified lead (they have a website they care about)
- Results are inherently shareable ("look how bad our site scored")
- Naturally leads to the product ("we fix all of this")
- Validates demand before the full platform is built
- The before/after data becomes marketing content ("We scanned 500 Swedish business sites -- here's what we found")

## 2. Scan Categories

### 2.1 Performance & Speed
Source: Lighthouse Performance API

| Check | What we look for | Why it matters |
|---|---|---|
| Core Web Vitals (LCP, INP, CLS) | Google's ranking signals | Directly affects SEO ranking since 2021 |
| Time to First Byte (TTFB) | Server response time | Slow hosting = slow everything |
| Total page weight | MB of assets loaded | Old sites often load 5-10MB+ |
| Image optimization | Uncompressed JPG/PNG, no WebP/AVIF | Often the #1 performance killer |
| Render-blocking resources | CSS/JS blocking first paint | Common on WordPress with 20+ plugins |
| HTTP/2 support | Protocol version | Many old hosts still serve HTTP/1.1 |

### 2.2 SEO
Source: Lighthouse SEO audit + custom checks

| Check | What we look for | Why it matters |
|---|---|---|
| Meta title | Present, correct length (50-60 chars) | #1 on-page SEO factor |
| Meta description | Present, correct length (150-160 chars) | Click-through rate from Google |
| H1 tag | Present, unique, one per page | Page structure signal |
| Image alt attributes | All images have descriptive alt text | SEO + accessibility |
| Canonical URL | Proper canonical tag | Prevents duplicate content penalties |
| Robots.txt | Exists and allows indexing | Basic crawlability |
| Sitemap.xml | Exists and valid | Helps Google discover all pages |
| Mobile-friendly viewport | Proper viewport meta tag | Google mobile-first indexing |
| Structured data | schema.org markup (LocalBusiness, etc.) | Rich snippets in search results |
| Open Graph tags | og:title, og:description, og:image | Social sharing appearance |
| Internal broken links | 404s within the site | Bad UX + wasted crawl budget |

### 2.3 Accessibility (WCAG 2.1 AA)
Source: axe-core (open source, used by Google/Microsoft/Deque)

| Check | What we look for | Why it matters |
|---|---|---|
| Color contrast | WCAG AA contrast ratios (4.5:1 text, 3:1 large text) | Readability for low-vision users |
| Image alt text | All non-decorative images have alt attributes | Screen reader support |
| Form labels | All inputs have associated labels | Usability + screen readers |
| Heading hierarchy | Logical order (no skipping h1 to h3) | Navigation for assistive tech |
| Keyboard navigation | All interactive elements reachable via Tab | Essential for motor disabilities |
| ARIA attributes | Correct usage (no invalid roles) | Screen reader compatibility |
| Language attribute | lang attribute on html tag | Screen readers need this for pronunciation |
| Focus indicators | Visible focus styles on interactive elements | Keyboard navigation visibility |
| Link text quality | No "click here" or "read more" without context | Meaningful navigation |

> EU Legal context: The European Accessibility Act (EAA) became enforceable on June 28, 2025. All businesses with 10+ employees or 2M+ EUR turnover offering digital services to EU customers must comply with WCAG 2.1 AA (via EN 301 549). Fines up to 3 million EUR. Swedish enforcement is handled by DIGG.

### 2.4 EU Legal Compliance
Source: Custom Playwright DOM inspection

| Check | What we look for | Why it matters |
|---|---|---|
| Cookie consent banner | Banner present on page load | Required by ePrivacy Directive + GDPR |
| Reject option | "Reject all" button exists and is equally prominent | IMY actively enforcing symmetry since April 2025 |
| No pre-consent tracking | Check if GA / Meta Pixel / tracking cookies load before consent | Major GDPR violation, fines up to 4% of global turnover |
| Privacy policy | Link to privacy policy exists in footer or cookie banner | GDPR Article 13/14 requirement |
| Cookie policy | Separate or combined cookie policy with categories | ePrivacy Directive requirement |
| Contact information | Business name, address, or org number visible | Swedish law (Lag om elektronisk handel) |
| SSL certificate | Valid HTTPS | Chrome shows "Not Secure" warning without it |

### 2.5 Security
Source: HTTP header inspection + Lighthouse best practices

| Check | What we look for | Why it matters |
|---|---|---|
| HTTPS | Valid SSL/TLS certificate | Baseline security |
| Mixed content | HTTP resources loaded on HTTPS page | Breaks the security chain |
| Security headers | CSP, X-Frame-Options, X-Content-Type-Options, HSTS | Protection against XSS, clickjacking |
| Server version exposure | Server header leaking Apache/nginx version | Makes targeted attacks easier |
| Outdated CMS | WordPress version detection (via generator meta tag) | Known vulnerabilities |

### 2.6 Modern Web Standards
Source: Playwright DOM analysis + custom checks

| Check | What we look for | Why it matters |
|---|---|---|
| Responsive design | Viewport meta + media queries + no horizontal scroll | 60%+ of traffic is mobile |
| Deprecated HTML | font, center, tables for layout | Signals an ancient codebase |
| Favicon | Favicon present | Professionalism |
| 404 page | Custom 404 exists | UX when links break |
| Page weight | Total assets < 3MB target | Speed + mobile data |
| Third-party bloat | Number of third-party scripts loaded | Common on old WordPress sites |

## 3. Scoring System

Each category gets a 0-100 score based on passed vs. failed checks, weighted by severity.

**Traffic light:**
- Red (0-40): Critical issues. Needs immediate attention.
- Orange (41-70): Room for improvement. Common issues found.
- Green (71-100): Good shape. Minor tweaks possible.

**Overall score -- weighted average:**

| Category | Weight |
|---|---|
| Performance & Speed | 20% |
| SEO | 20% |
| Accessibility (WCAG) | 20% |
| EU Legal Compliance | 20% |
| Security | 10% |
| Modern Web Standards | 10% |

**Results page design:**
- Overall score prominently displayed (big number + color)
- 6 category cards, each with score + traffic light + expandable details
- Each failed check shows: what's wrong, why it matters, how we fix it
- Clear CTA: "Vi fixar allt detta."
- Option to download PDF report (V2)
- Share button (V2)

## 4. Technical Implementation

### Stack
| Tool | Purpose | Cost |
|---|---|---|
| Playwright | Page rendering, DOM inspection, screenshot | Free |
| Lighthouse Node API | Performance, SEO, accessibility baseline | Free |
| axe-core | Deep WCAG 2.1 AA analysis | Free |
| Custom checks | Cookie banner, legal compliance, security headers | Free |
| Hono API | Endpoint to trigger scans, serve results | In stack |
| Supabase | Store scan results, email signups | In stack |
| Nodemailer | Send scan report email (via one.com SMTP) | Free |

### Architecture
```
User submits URL + email on landing page
  -> Hono API receives request
    -> Validates URL (reachable, not blocked)
      -> Stores email + URL in Supabase (leads table)
        -> Triggers Inngest job: "scan.requested"
          -> Inngest runs scan pipeline:
            1. Playwright launches headless Chrome
            2. Lighthouse runs performance + SEO + a11y audits
            3. axe-core runs deep WCAG analysis
            4. Custom checks: cookie banner, legal, security headers
            5. Results aggregated + scored
          -> Results stored in Supabase (scans table)
          -> Nodemailer sends email with link to results page
          -> SSE pushes "scan complete" to waiting frontend
```

### Database schema
```sql
leads:
  id, email, url, source (scan/waitlist/preview), created_at

scans:
  id, lead_id, url, overall_score,
  performance_score, seo_score, accessibility_score,
  legal_score, security_score, standards_score,
  details (JSONB -- full check results),
  created_at
```

## 5. Build Priority

**Phase 1 (ship first):**
- Landing page with URL input + email capture
- Scan pipeline (Lighthouse + axe-core + custom checks)
- Results page with traffic-light scores
- Email delivery of results

**Phase 2 (after initial traction):**
- PDF report download
- Social sharing ("Share your score")
- Comparison tool ("See how your competitors score")
- Re-scan ("Check your progress after we rebuild")

**Phase 3 (integration with main platform):**
- Scan results feed into the migration pipeline
- Before/after comparison (scan score pre vs. post migration)
- Automated "your site improved" email after rebuild completes
