# Programmatic SEO System

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | Done | Infrastructure: content model, sitemap, localized slugs, OG tags, JSON-LD |
| 1 | Done | Compliance guides (3 new pages, both locales) |
| 2 | In progress | Action and problem pages (5 pages, both locales) |
| 3 | Not started | CMS-specific pages (3 pages, both locales) |
| 4 | Not started | Issue explainer pages (8 pages, both locales) |
| 5 | Not started | Comparison and tool pages (5 pages, both locales) |
| 6 | Not started | Measurement, iteration, content refresh |

**Current state:** Phase 2 in progress. All 5 compliance pages live. 2 of 5 action/problem pages live (free-website-test, website-health-check). Guides hub redesigned with card grid layout and localized Swedish slug (`/guider`). Footer updated with all compliance pages.

**Scan category names (updated):** Performance, SEO, Accessibility, Trust and compliance, Security, Website quality. These replaced the earlier names "Legal compliance" and "Modern standards."

**Scan analysis tracks (updated April 2026):** The scan now runs five analysis tracks: Lighthouse, DOM checks (axe-core via Playwright), HTTP/TLS header analysis, external security checks (Google Web Risk, MDN Observatory), and broken link detection. Content pages referencing the scan should reflect this.

**Total planned:** 24 new pages across 5 families. 2 existing pages (accessibility, privacy-compliance) reclassified as compliance. 1 existing page (how-scan-works) stays standalone.

**Next step:** Phase 2, page 3 of 5 (slow-website).

### Phase 0 implementation notes

**What was built:**
- Extended `ContentFrontmatter` type with `family`, `relatedChecks`, `relatedSlugs`, `noindex`, `localeSlug`
- Added `gray-matter` for fast frontmatter-only parsing
- Added slug resolution utilities: `resolveSlug()`, `getSlugMapping()`, `getLocaleSlug()`, `getAllContentPages()`
- Locale-aware `generateStaticParams` using parent locale param
- Redirect from English slug to Swedish slug on vivotiv.se (e.g., `/accessibility` redirects to `/tillganglighet`)
- Full page metadata: canonical URLs, OG tags (article type), hreflang alternates, robots meta
- Article + BreadcrumbList JSON-LD structured data on all content pages
- Visual breadcrumbs component (`features/content/breadcrumbs.tsx`)
- Scan CTA MDX component (`features/content/scan-cta.tsx`), use `<ScanCta />` in any MDX file
- Guides hub page at `/guides` (`/guider` on vivotiv.se) grouping content by family, redesigned with ContentCardGrid layout
- Sitemap dynamically generates entries for all non-noindex content pages
- Footer and header updated with guides link
- Message files updated with `breadcrumbs`, `scanCta`, `guides` namespaces (both locales)
- Existing pages reclassified: accessibility (`compliance`, `localeSlug: "tillganglighet"`), privacy-compliance (`compliance`, `localeSlug: "gdpr-och-cookieefterlevnad"`), how-scan-works (`standalone`, `localeSlug: "hur-skanningen-fungerar"`)

**What was deferred from Phase 0:**
- Author byline and about page (E-E-A-T): not blocking for content pages, add when content volume justifies it
- Per-page OG images: using default for now, template-generated images are a later optimization
- `not-prose` pattern for MDX components: breadcrumbs and ScanCta use `!important` overrides to escape article styling, works but could be cleaner

---

## System overview

Build a library of search-optimized content pages that capture Swedish SMBs searching for compliance, performance, and website quality information. Every page funnels to the free scan as the primary CTA.

### Principles

- **Quality over quantity.** 30 strong pages beat 100 thin ones. Every page must contain genuinely useful, specific information that justifies its existence.
- **Sweden-first.** Compliance pages reference IMY, Swedish fines, Swedish legal context. English versions broaden to EU framing but stay specific.
- **One conversion path.** Every page leads to the scan. No competing CTAs, no newsletter signups, no ebook downloads.
- **Human voice.** Follow MARKETING-CONTEXT.md rules. No AI-sounding copy, no marketing speak, no superlatives. Write like someone who knows this domain.
- **Maintain both locales.** Every page ships in both en and sv. Swedish copy is written natively, not translated from English.
- **GEO-ready.** Structure content so AI systems can parse and cite it. Lead with direct answers, use FAQ format where natural, keep definitions concise and standalone.

### What this is NOT

- Not a blog. These are evergreen resource pages, not dated posts.
- Not mass-generated content. Each page family is capped and quality-gated.
- Not keyword-stuffed landing pages. The content must be genuinely useful to someone who reads it.

---

## Page families

### Family 1: Compliance guides (Phase 1)

**Intent:** Swedish SMBs searching for "what does the law require of my website?"

**Why it fits:** EU legal compliance is Vivotiv's strongest differentiator (Lighthouse checks none of it). These searches come from business owners who know they have obligations but need specifics. High conversion potential because the scan directly validates compliance.

**Pages:**

| Slug | EN title | SV slug | SV title | Status |
|------|----------|---------|----------|--------|
| `accessibility` | The EU Accessibility Act and Your Website | `tillganglighet` | EU:s tillgänglighetsdirektiv och er webbplats | **Exists.** Reclassify as compliance, add new frontmatter fields |
| `privacy-compliance` | GDPR and Cookie Compliance for Websites | `gdpr-och-cookieefterlevnad` | GDPR och cookieefterlevnad för webbplatser | **Exists.** Reclassify as compliance, add new frontmatter fields |
| `cookie-consent-requirements` | Cookie Consent Requirements in the EU | `krav-cookie-samtycke` | Krav på cookie-samtycke i EU | New. Deep-dive on consent implementation |
| `website-security-basics` | Website Security Requirements for Businesses | `sakerhetskrav-hemsida` | Säkerhetskrav för företagswebbplatser | New |
| `website-compliance-checklist` | Website Compliance Checklist for Swedish Businesses | `checklista-webbplats-efterlevnad` | Checklista för webbplatsefterlevnad | New. Links to all other compliance pages |

**Existing page integration:**

- **`accessibility`** is already a compliance guide. It covers the EU Accessibility Act, WCAG 2.1 AA, Swedish enforcement (PTS, DIGG, 10M SEK fines), and cites primary sources. Reclassify as `family: "compliance"`. Add `localeSlug`, `relatedChecks`, `relatedSlugs`. No content changes needed.
- **`privacy-compliance`** is already a compliance guide. It covers GDPR requirements, cookie consent, reject button, IMY enforcement, pre-consent tracking, and the scan checks. Reclassify as `family: "compliance"`. Add new frontmatter fields. No content changes needed. This replaces the originally planned `gdpr-website-requirements` page.
- **`how-scan-works`** is a product/trust page, not a compliance guide. Stays as `family: "standalone"`. Add new frontmatter fields only.

**Why `gdpr-website-requirements` was dropped:** The existing `privacy-compliance` page already covers GDPR requirements, cookie consent basics, IMY enforcement, and scan checks. Creating a separate GDPR page would cannibalize it. The existing page is well-written and already ranks for the target intent.

**Scoping `cookie-consent-requirements` to avoid overlap:** The existing `privacy-compliance` page covers cookie consent at a high level. The new `cookie-consent-requirements` page goes deeper on implementation specifics: CMP platforms, reject button UI patterns, pre-consent technical details, LEK (Lagen om elektronisk kommunikation), and specific CMP detection. The two pages link to each other but serve different depths of the same topic.

**Required unique data per page:**
- Specific regulation references (article numbers, enforcement dates)
- Swedish enforcement context (IMY decisions, fine amounts, real examples)
- Which Vivotiv scan checks map to each requirement
- Concrete remediation steps (not generic advice)
- Links to authoritative sources (IMY.se, EUR-Lex, riksdagen.se)

**Conversion path:** Informational content with sections explaining what the scan checks for each requirement. Inline CTA: "Check if your website meets these requirements" linking to scan form.

**Risk:** Low. These are genuine informational pages with clear search intent and real differentiation.

### Family 2: Action and problem pages (Phase 2)

**Intent:** Someone actively looking to test their website, or experiencing a specific problem and searching for help.

**Why it fits:** These are the highest-conversion pages in the system. Someone searching "test my website" or "my website is slow" is one click away from submitting the scan. Two sub-types:

**Type A: Action pages.** Capture people who want to run a check right now. "Free website test," "gratis webbplatstest." These are essentially optimized landing pages for the scan, but with enough genuine content (what gets tested, how scoring works, what to expect) to rank and satisfy search intent.

**Type B: Problem pages.** Capture frustrated business owners mid-problem. "My website is slow," "website not secure warning." These explain the problem, its business impact, common causes, and offer the scan as the diagnostic step.

**Pages:**

| Slug | EN title | SV slug | SV title | Type | Target search query |
|------|----------|---------|----------|------|---------------------|
| `free-website-test` | Free Website Test | `gratis-webbplatstest` | Gratis webbplatstest | A | "free website test," "website checker" |
| `website-health-check` | Website Health Check | `webbplats-halsokontroll` | Webbplats hälsokontroll | A | "website health check," "site audit" |
| `slow-website` | Why Your Website Is Slow (and What It Costs You) | `langsam-hemsida` | Varför er hemsida är långsam (och vad det kostar er) | B | "my website is slow," "min hemsida är långsam" |
| `website-not-secure` | "Not Secure" Warning on Your Website | `hemsida-inte-saker` | Varningen "inte säker" på er hemsida | B | "website not secure," "hemsida inte säker" |
| `website-not-ranking` | Why Your Website Doesn't Show Up on Google | `syns-inte-pa-google` | Varför er hemsida inte syns på Google | B | "website not ranking," "syns inte på google" |

**Content approach for Type A pages:**
- Brief explanation of what the test covers (six categories, 150+ checks)
- What the results look like (score breakdown, specific issues, remediation)
- Embedded or prominent scan CTA (this is the page's core purpose)
- Enough unique content to avoid being a thin doorway page (explain scoring model, what makes this different from Lighthouse)

**Content approach for Type B pages:**
- Open with the problem and its business impact (lost visitors, lost revenue, compliance risk)
- Explain common causes in plain language
- Show how the scan identifies the specific issues
- Scan CTA as the diagnostic next step

**Conversion path:** Direct. These pages exist to convert. The scan form should be prominent and above the fold.

**Risk:** Low for Type B (genuine informational content). Type A pages risk being thin if not enough substance beyond the CTA. Quality gate: minimum 500 words of genuine content even on action pages.

### Family 3: CMS-specific pages (Phase 3)

**Intent:** Swedish SMBs searching for compliance or quality issues specific to their CMS platform.

**Why it fits:** SMBs don't search "GDPR website requirements." They search "WordPress GDPR" or "Squarespace cookie banner." The CMS is the frame through which they understand their website. Each CMS has known default compliance gaps, making these pages genuinely differentiated. The scan works on any site regardless of CMS, so the conversion path is seamless.

**Pages:**

| Slug | EN title | SV slug | SV title | Target search queries |
|------|----------|---------|----------|-----------------------|
| `wordpress-website-audit` | WordPress Website Audit: What to Check | `wordpress-webbplatsgranskning` | WordPress-webbplatsgranskning: vad ni bör kontrollera | "wordpress audit," "wordpress säkerhet," "wordpress gdpr" |
| `squarespace-website-audit` | Squarespace Website Audit: What to Check | `squarespace-webbplatsgranskning` | Squarespace-webbplatsgranskning: vad ni bör kontrollera | "squarespace accessibility," "squarespace gdpr" |
| `wix-website-audit` | Wix Website Audit: What to Check | `wix-webbplatsgranskning` | Wix-webbplatsgranskning: vad ni bör kontrollera | "wix website check," "wix tillgänglighet" |

**Content approach per CMS page:**
- Known default compliance gaps for that CMS (specific, not generic)
  - WordPress: plugin-dependent security, outdated core/themes, tracking scripts in themes loading before consent, limited default accessibility
  - Squarespace: limited accessibility customization, cookie consent depends on region settings, closed-source constraints on security headers
  - Wix: auto-generated code quality issues, limited control over security headers, accessibility gaps in templates
- Which Vivotiv scan checks catch these issues
- What "good" looks like for that CMS
- Scan CTA: "Run a free audit on your {CMS} site"

**Differentiation:** Most CMS audit content is written for developers. These pages speak to the business owner who chose WordPress/Squarespace because it was easy, and now needs to know if their site is compliant. No other tool frames the audit through the CMS lens with EU compliance focus.

**Conversion path:** CMS-specific scan CTA. The reader already self-identifies as a {CMS} user, making the scan feel directly relevant.

**Risk:** Medium. CMS-specific content needs to stay current as platforms update. WordPress especially changes frequently. Set a review cadence in Phase 6.

### Family 4: Issue explainer pages (Phase 4)

**Intent:** Someone who encountered a technical term (from a scan result, a developer conversation, or a Google search) and wants to understand what it means for their business.

**Why it fits:** Captures long-tail search traffic. When someone gets a scan result mentioning "Content Security Policy" or "HSTS," they Google it. These pages answer that question and bring them back into the funnel.

**Pages (initial set, not all 150+ checks):**

Only checks that meet ALL of these criteria:
1. Real search volume (people actually search for this)
2. Business relevance (an SMB owner would care, not just developers)
3. Enough depth for 500+ words of genuinely useful content
4. Maps to a specific Vivotiv scan check
5. Does not overlap with a compliance guide or problem page

| Slug | EN title | Maps to check |
|------|----------|---------------|
| `what-is-lcp` | What Is Largest Contentful Paint (LCP) | Performance: LCP |
| `what-is-cls` | What Is Cumulative Layout Shift (CLS) | Performance: CLS |
| `what-is-core-web-vitals` | What Are Core Web Vitals | Performance: LCP, CLS, TBT |
| `what-is-content-security-policy` | What Is Content Security Policy (CSP) | Security: CSP |
| `what-is-hsts` | What Is HSTS (HTTP Strict Transport Security) | Security: HSTS |
| `what-is-structured-data` | What Is Structured Data (Schema Markup) | SEO: structured data |
| `what-is-robots-txt` | What Is robots.txt and Why Your Site Needs One | SEO: robots.txt |
| `what-are-security-headers` | What Are Security Headers | Security: all header checks |

**Removed from this family to avoid cannibalization:**
- `what-is-cookie-consent` overlaps with `cookie-consent-requirements` (compliance guide)
- `what-is-wcag` overlaps with the existing `accessibility` page, which already explains WCAG 2.1 AA thoroughly (including what it means in practice, specific criteria, and enforcement)

**Growth path:** Add more pages over time, but only when they clear the quality gates. Never auto-generate pages for all 150+ checks.

**Conversion path:** Explain the concept, show why it matters for business, then: "Not sure where your site stands? Run a free scan."

**Risk:** Medium. Some topics (Core Web Vitals, robots.txt) have heavy competition from established sites. Differentiation comes from the Swedish business angle and linking to specific scan checks.

### Family 5: Comparison and tool pages (Phase 5)

**Intent:** Someone comparing website audit tools or searching for the best option.

**Why it fits:** High-intent traffic from people actively evaluating tools. The key insight: nobody searches "Vivotiv vs Lighthouse" because they don't know Vivotiv yet. But "Lighthouse vs PageSpeed Insights" has real search volume. We capture that traffic with an honest comparison, then position Vivotiv as the tool that covers what both are missing (trust and compliance checks, accessibility depth, business-readable output).

**Two types of comparison pages:**

**Type A: Third-party vs third-party.** We compare popular tools against each other honestly, then show what neither covers. This captures the actual search queries people type. Vivotiv is positioned as the next step, not the main subject.

**Type B: Tool roundups.** Broader "best tools for X" pages where Vivotiv is one entry among several, positioned for its specific strengths (EU compliance, unified scorecard).

**Pages:**

| Slug | EN title | Type | Target search query |
|------|----------|------|---------------------|
| `lighthouse-vs-pagespeed-insights` | Google Lighthouse vs PageSpeed Insights | A | "lighthouse vs pagespeed insights" |
| `lighthouse-vs-gtmetrix` | Google Lighthouse vs GTmetrix | A | "lighthouse vs gtmetrix" |
| `free-website-audit-tools` | Free Website Audit Tools Compared | B | "free website audit tools," "best website checker" |
| `website-audit-tools-eu-compliance` | Website Audit Tools for EU Compliance | B | "GDPR website check tool," "EU compliance checker" |
| `wave-vs-axe` | WAVE vs axe: Accessibility Testing Tools | A | "wave vs axe accessibility" |

**Content approach for Type A pages:**
- Open with what both tools do well (fair, factual)
- Explain the key differences between them
- Show what neither tool covers (EU trust and compliance, unified business scoring)
- Close with: "If you need a complete picture, not just performance or accessibility in isolation, run a free scan"
- Vivotiv enters naturally as the answer to a gap, not as the main subject

**Content approach for Type B pages:**
- Honest roundup of available tools with pros and cons
- Vivotiv listed alongside others, positioned for EU compliance and business readability
- No "we're the best" framing, just: "if your priority is X, this tool fits; if it's Y, that one does"

**Required differentiation:** These must be genuinely useful comparison pages. Someone who reads the Lighthouse vs PageSpeed page should walk away understanding the actual differences, even if they never click the scan. The Vivotiv pitch is the last 20% of the page, not the reason it exists.

**Conversion path:** Soft. The comparison content builds trust. The scan CTA appears at the end as the logical next step for readers who realize neither compared tool checks compliance.

**Risk:** Medium. Comparison pages have competition, but most existing ones don't cover the EU compliance angle. The WAVE vs axe page is niche but maps directly to our accessibility differentiator. Keep tone factual and resist making every page about Vivotiv.

---

## Content model

### Extended frontmatter schema

```typescript
export type ContentFrontmatter = {
  title: string;
  description: string;
  lastUpdated: string;
  // SEO fields
  family?: "compliance" | "actions" | "cms" | "checks" | "comparisons" | "standalone";
  relatedChecks?: string[];     // Vivotiv scan check IDs this page relates to
  relatedSlugs?: string[];      // Other content pages to cross-link
  noindex?: boolean;            // Quality gate: set true for pages that don't meet standards yet
  // Localized slug (optional, for Swedish SEO)
  localeSlug?: string;          // Locale-specific URL slug (e.g., "gdpr-krav-hemsida" in sv.mdx)
};
```

The `family` field:
- `accessibility`: `"compliance"` (reclassified)
- `privacy-compliance`: `"compliance"` (reclassified)
- `how-scan-works`: `"standalone"`

### File structure

Keep the flat directory structure. No nesting by family.

```
content/pages/
  accessibility/          (existing, reclassified as compliance)
  how-scan-works/         (existing, standalone)
  privacy-compliance/     (existing, reclassified as compliance)
  free-website-test/
    en.mdx
    sv.mdx
  wordpress-website-audit/
    en.mdx
    sv.mdx
  what-is-lcp/
    en.mdx
    sv.mdx
  lighthouse-vs-pagespeed-insights/
    en.mdx
    sv.mdx
  ...
```

The directory name is always the English slug. The URL structure uses locale-specific slugs when available:

- `vivotiv.com/cookie-consent-requirements` (EN: uses directory name)
- `vivotiv.se/krav-cookie-samtycke` (SV: uses `localeSlug` from sv.mdx frontmatter)
- `vivotiv.com/accessibility` (EN: existing page, directory name)
- `vivotiv.se/tillganglighet` (SV: uses `localeSlug` from sv.mdx frontmatter)

### Localized slugs

Swedish SEO requires Swedish URLs. `vivotiv.se/tillganglighet` will outrank `vivotiv.se/accessibility` for Swedish queries because Google factors URL language signals into locale relevance.

**Implementation:**
- The `localeSlug` field in sv.mdx frontmatter defines the Swedish URL
- If `localeSlug` is absent, the directory name is used (backwards-compatible)
- A slug resolution function maps locale slugs to directory names at request time
- The route handler checks: is this slug a direct directory match OR a locale-specific slug?
- Sitemap generates locale-specific URLs with correct hreflang alternates
- Canonical URLs point to the locale-specific slug for each domain

**Example frontmatter (sv.mdx for existing accessibility page):**
```yaml
---
title: "EU:s tillgänglighetsdirektiv och er webbplats"
description: "Tillgänglighetsdirektivet kräver WCAG 2.1 AA-efterlevnad sedan juni 2025. Läs vad det innebär för er webbplats."
lastUpdated: "Senast uppdaterad mars 2026"
family: "compliance"
localeSlug: "tillganglighet"
relatedChecks: ["accessibility"]
relatedSlugs: ["privacy-compliance", "website-compliance-checklist"]
---
```

The English version does not need `localeSlug` since the directory name is already the English slug.

### Why flat, not nested

- The current routing (`[locale]/(content)/[slug]`) already works
- No code changes needed for the content pipeline (except slug resolution)
- Flat URLs perform well for SEO (Google does not weight URL hierarchy significantly)
- Logical grouping happens through frontmatter `family` field and hub pages, not directory structure

---

## Quality gates

A content page is indexable only if ALL of these are true:

| Gate | Rule |
|------|------|
| Distinct intent | The page targets a search query that no other page on the site covers |
| Unique substance | At least two sections contain information not found on sibling pages |
| Locale completeness | Both en.mdx and sv.mdx exist with native (not translated) copy |
| Swedish specificity | SV version references Swedish enforcement context (IMY, Swedish law, Swedish examples) |
| No placeholders | Zero `[TODO]`, `[TBD]`, or empty sections |
| Scan connection | Page references at least one specific Vivotiv scan check or category |
| Word count | Minimum 500 words of body content (excluding frontmatter) |
| CTA present | At least one scan CTA appears naturally in the content |
| Copy guidelines | Passes MARKETING-CONTEXT.md rules (no em dashes, no AI slop, no superlatives, no marketing speak) |
| Sources cited | Compliance and legal pages link to authoritative sources (IMY.se, EUR-Lex, W3C, riksdagen.se) |
| GEO-ready | First paragraph directly answers the page's target search query in a quotable way |
| No cannibalization | No other page on the site targets the same primary keyword |

If a page fails any gate, set `noindex: true` in frontmatter until fixed.

---

## Site architecture

### Hub page

Add a `/guides` page that lists all content pages grouped by family.

Structure:
- Section per family ("Compliance," "Website Problems," "CMS Guides," "Understanding Your Scan," "Tool Comparisons")
- Each entry: title, one-line description, link
- Family sections only appear if they have published (non-noindex) pages

This page serves as:
- An internal linking hub (distributes link equity)
- A browsable resource library for visitors
- A crawl path for search engines to discover all content

### Internal linking rules

1. **Every content page links to the scan form** at least once
2. **Every content page links to at least one related content page** via `relatedSlugs`
3. **The compliance checklist page links to all compliance guides**
4. **Issue explainer pages link to the parent compliance guide** when relevant
5. **CMS pages link to relevant compliance guides** (e.g., WordPress page links to GDPR and cookie consent guides)
6. **Problem pages link to relevant issue explainers** (e.g., "website is slow" links to Core Web Vitals)
7. **The landing page links to the guides hub** (footer or dedicated section)
8. **The guides hub links to every published content page**

### Footer strategy

The footer is the strongest sitewide internal linking surface. Every page on the site renders the footer, so every link in it passes link equity from every page to every linked target. Use this strategically.

**Structure: one column per family, expanded as content ships.**

Current footer (Phase 0):
```
Resources          Legal          Language
Accessibility      Privacy        Svenska/English
Privacy & GDPR     Cookies
How the Scan Works Preferences
Guides
```

After Phase 1 (compliance guides ship), add a Compliance column:
```
Resources          Compliance                Legal          Language
How the Scan Works Cookie Consent            Privacy        Svenska/English
Guides             Website Security          Cookies
                   Compliance Checklist      Preferences
```

Accessibility and Privacy & GDPR move from Resources to Compliance since they are now compliance family pages. Resources keeps standalone pages and the guides hub link.

After Phase 2-5, add columns as families have enough published pages:
- "Tools" column for comparison pages
- "CMS Guides" column for CMS-specific pages
- Problem and explainer pages stay discoverable via the guides hub (not all need footer links)

**Rules:**
- Only add a footer column when a family has 3+ published pages
- List the highest-value pages from each family, not all of them
- Keep total footer links under 20 to avoid dilution
- Update the footer as part of each phase's definition of done

### Breadcrumbs

Add breadcrumbs to the content layout:

- Standalone pages: Home > {Page Title}
- All other families: Home > Guides > {Page Title}

Use JSON-LD BreadcrumbList structured data.

### Sitemap

Update `sitemap.ts` to:

1. Call `getAllContentSlugs()` to get all content pages
2. Load frontmatter for each to check `noindex` and `localeSlug`
3. Generate entries for each non-noindex page with locale-specific URLs
4. Add `alternates.languages` with correct hreflang per domain
5. Set `changeFrequency: "monthly"` and `priority: 0.7` for content pages

### Structured data

Add to content pages:

- **Article** schema (headline, description, dateModified, publisher, author)
- **BreadcrumbList** schema
- **FAQPage** schema where the content naturally contains Q&A pairs
- **HowTo** schema for checklist-style pages

### E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

Compliance and legal content falls under Google's YMYL (Your Money Your Life) category. E-E-A-T signals directly affect ranking for these pages.

**Required signals:**

1. **Author attribution.** Every content page shows a byline with the author's name and role. For now, attribute to the founder/company. Add an author JSON-LD `Person` schema.

2. **About page.** Create a company/about page that establishes credentials. Link to it from the content layout footer. This page should explain who Vivotiv is, what expertise backs the content, and why readers should trust the advice.

3. **Source citations.** Every compliance page must link to authoritative sources:
   - IMY.se for Swedish GDPR enforcement
   - EUR-Lex for EU regulation text
   - W3C/WAI for accessibility standards
   - riksdagen.se for Swedish law references
   - Do not link to secondary sources (blogs, summaries) when the primary source is available

4. **Content freshness.** The `lastUpdated` field must reflect actual review dates. Stale compliance content is a negative ranking signal. Quarterly review cadence in Phase 6.

### GEO (Generative Engine Optimization)

~40% of AI-generated answers reference Reddit (per MARKETING-CONTEXT.md). To appear in AI-generated recommendations and zero-click answer surfaces:

1. **Lead with the answer.** The first paragraph of every page should directly, concisely answer the page's target search query. AI systems excerpt the first clear answer they find.

2. **FAQ sections.** Where the content naturally contains Q&A patterns, use explicit question/answer format with `##` headings as questions. Add FAQPage structured data.

3. **Standalone definitions.** Key definitions should be self-contained in a single paragraph. AI may excerpt just one paragraph, so it must make sense without surrounding context.

4. **Structured data.** Every structured data type (Article, FAQ, HowTo) helps AI systems parse and cite content correctly.

5. **Avoid vague framing.** "It depends" and "there are many factors" are unhelpful for AI citation. State the concrete answer, then add nuance.

### Open Graph and social sharing

Every content page needs page-specific OG metadata:

- `og:title` (same as page title, or shortened for social)
- `og:description` (same as meta description)
- `og:type` = "article"
- `og:image` (use a template-generated image with the page title, or a default Vivotiv OG image until per-page images are built)
- `og:locale` (en_US or sv_SE)
- `og:locale:alternate` (pointing to the other locale)
- Twitter card tags (`twitter:card`, `twitter:title`, `twitter:description`)

These are generated from frontmatter in the content page metadata function.

---

## Implementation phases

### Phase 0: Infrastructure

**Goal:** Extend the content system to support all page families without breaking existing pages.

**Tasks:**

1. **Extend `ContentFrontmatter` type** in `apps/web/src/lib/content.ts`
   - Add optional fields: `family`, `relatedChecks`, `relatedSlugs`, `noindex`, `localeSlug`
   - Existing pages continue to work (all new fields are optional)

2. **Implement localized slug resolution**
   - Add a function that builds a slug-to-directory mapping by scanning all content pages' frontmatter for `localeSlug` fields
   - Update the content page route handler to resolve locale-specific slugs
   - Ensure the English slug still works on vivotiv.com (no `localeSlug` needed for EN)
   - Add redirects: if someone hits `vivotiv.se/accessibility` and a Swedish slug exists, redirect to `vivotiv.se/tillganglighet`

3. **Update sitemap** in `apps/web/src/app/sitemap.ts`
   - Import `getAllContentSlugs` and `getContentPage`
   - Generate entries for all content pages (both locales)
   - Use `localeSlug` for Swedish URLs when available
   - Skip pages with `noindex: true`
   - Add `alternates.languages` for cross-domain hreflang

4. **Add breadcrumbs component**
   - Create in `apps/web/src/features/content/` (feature folder)
   - Render based on frontmatter `family` field
   - Include JSON-LD BreadcrumbList

5. **Add scan CTA component for MDX**
   - A reusable inline CTA block that content pages can embed
   - Renders the scan form URL with locale-appropriate copy
   - Pass as MDX component to `compileMDX` options

6. **Create guides hub page**
   - Route: `apps/web/src/app/[locale]/(content)/guides/page.tsx`
   - Lists all content pages grouped by `family`
   - Metadata: title, description for the hub page
   - Translatable via message files

7. **Reclassify existing pages with new frontmatter**
   - accessibility: `family: "compliance"`, add `localeSlug: "tillganglighet"` to sv.mdx, add `relatedChecks` and `relatedSlugs`
   - privacy-compliance: `family: "compliance"`, add `localeSlug: "gdpr-och-cookieefterlevnad"` to sv.mdx, add `relatedChecks` and `relatedSlugs`
   - how-scan-works: `family: "standalone"`, add `relatedSlugs` only

8. **Add Article structured data** to content layout
   - JSON-LD with headline, description, dateModified, publisher, author

9. **Add page-specific OG tags** to content metadata generation
   - Generate `og:title`, `og:description`, `og:type`, `og:locale` from frontmatter
   - Add `og:locale:alternate` for the other locale
   - Use a default OG image template (per-page images are a later optimization)

10. **Add author byline** to content layout
    - Show author name and role below the page title
    - Include author `Person` JSON-LD

**Definition of done:** Sitemap includes existing content pages with correct hreflang. Localized slug resolution works. Guides hub renders and is linked from footer. Breadcrumbs visible on content pages. OG tags and Article schema present. No visual regressions on existing pages.

### Phase 1: Compliance guides

**Goal:** Publish 3 new compliance guide pages in both locales. Reclassify 2 existing pages (done in Phase 0).

**Pages to create (in order):**

#### 1. `cookie-consent-requirements`

**EN search intent:** "cookie consent requirements EU," "cookie banner requirements," "do I need a cookie banner"
**SV search intent:** "cookie-samtycke krav," "cookie banner krav," "behöver jag cookie banner"
**SV slug:** `krav-cookie-samtycke`

**Content outline (scoped to avoid overlap with privacy-compliance):**
The existing `privacy-compliance` page covers GDPR cookie basics. This page goes deeper on implementation:
- When you need a cookie banner (and when you don't, e.g., strictly necessary cookies only)
- The reject button requirement: UI patterns that comply vs patterns that don't (with concrete examples)
- Pre-consent tracking in detail: how to verify what loads before consent, common offenders by platform
- CMP platforms compared: what Cookiebot, CookieYes, OneTrust, and built-in CMS solutions actually do and where they fall short
- LEK (Lagen om elektronisk kommunikation): the Swedish law that implements ePrivacy, and how it differs from GDPR consent
- How the Vivotiv scan detects these issues (15+ CMP implementations, shadow DOM, pre-consent behavior analysis)
- Section: "Check your cookie implementation" with scan CTA

**Differentiation:** Goes beyond "do I need a cookie banner" into implementation specifics. CMP comparison, reject button UI patterns, and Swedish-specific LEK context are not covered by generic GDPR guides or by the existing privacy-compliance page.

**Sources to cite:** IMY.se, ePrivacy Directive (2002/58/EC), LEK (Lagen om elektronisk kommunikation)

**Related checks:** cookie-banner, reject-button, pre-consent-scripts, pre-consent-cookies

#### 2. `website-security-basics`

**EN search intent:** "website security requirements," "how to secure my website," "website security headers"
**SV search intent:** "webbplatssäkerhet," "säkerhetskrav hemsida," "hur säkrar jag min hemsida"
**SV slug:** `sakerhetskrav-hemsida`

**Content outline:**
- Why website security matters for small businesses (not just enterprise)
- HTTPS and TLS: the baseline that many sites still get wrong
- Security headers explained in plain language (CSP, HSTS, X-Frame-Options)
- What "server technology exposure" means and why it matters
- Common vulnerabilities in outdated CMS installations
- How the Vivotiv scan checks security headers and TLS configuration
- Section: "Check your website's security" with scan CTA

**Differentiation:** Business-focused, not developer documentation. Explains what each header protects against in terms a business owner understands.

**Related checks:** csp, hsts, x-frame-options, x-content-type-options, referrer-policy, permissions-policy, server-exposure, tls-certificate

#### 3. `website-compliance-checklist`

**EN search intent:** "website compliance checklist," "is my website compliant," "website legal requirements"
**SV search intent:** "checklista webbplats efterlevnad," "webbplats lagkrav," "är min hemsida laglig"
**SV slug:** `checklista-webbplats-efterlevnad`

**Content outline:**
- A structured checklist covering all six scan categories (performance, SEO, accessibility, trust and compliance, security, website quality)
- GDPR and privacy (links to /privacy-compliance)
- Accessibility and the EU Accessibility Act (links to /accessibility)
- Cookie consent (links to /cookie-consent-requirements)
- Security basics (links to /website-security-basics)
- SEO as a business requirement (brief, links to scan)
- Performance as a business requirement (brief, links to scan)
- Section: "Run the full check automatically" with scan CTA

**Differentiation:** This is the hub page for compliance content. It connects all the guides and positions the scan as the automated version of the checklist.

**Related checks:** all categories

**Writing guidelines for Phase 1:**
- Follow MARKETING-CONTEXT.md strictly
- Open with the outcome, not the regulation
- Use real numbers (fine amounts, percentages, dates)
- Swedish versions use "Er/er" not "din/du"
- No em dashes
- Reference specific Vivotiv scan checks by name where natural
- Each page should work as a standalone resource (someone may land directly from search)
- First paragraph must directly answer the target search query (GEO)
- Cite authoritative sources for every legal claim (E-E-A-T)

**Definition of done:** 3 new pages published in both locales. 2 existing pages reclassified with updated frontmatter. All 5 compliance pages pass quality gates. Sitemap updated with localized slugs. Pages linked from guides hub. Internal cross-links in place.

### Phase 2: Action and problem pages

**Goal:** Publish 5 action/problem pages in both locales.

**Approach:**
- Type A pages (action) are essentially optimized scan landing pages with enough substance to rank
- Type B pages (problem) follow a consistent structure: problem, impact, causes, diagnosis (scan CTA)
- These have the highest conversion potential of any family, so prioritize speed to publish

**Content template for Type A (action) pages:**

```
## What gets tested

Brief overview of the six categories (performance, SEO, accessibility, trust and compliance, security, website quality).
Not a feature list. Focus on what the reader will learn about their site.

## How scoring works

Brief explanation of the 0-100 scoring model and traffic lights.

## What to expect in your results

What a typical result looks like. Category scores, specific issues, remediation guidance.

## Run a free test

Prominent scan CTA.
```

**Content template for Type B (problem) pages:**

```
## {First paragraph: direct answer to the search query. GEO-optimized.}

## What this costs your business

Business impact with real numbers. Lost visitors, revenue, compliance risk.

## Common causes

3-5 specific causes explained in plain language.
Link to relevant issue explainer pages where they exist.

## How to find out what's wrong

The scan as a diagnostic tool. Which specific checks identify this problem.

## Check your website

Scan CTA.
```

**Writing order (conversion potential):**
1. free-website-test (highest direct intent)
2. website-health-check (second direct intent)
3. slow-website (most commonly searched problem)
4. website-not-ranking (high frustration, common search)
5. website-not-secure (urgent problem, strong scan connection)

**Definition of done:** 5 pages published in both locales. All pass quality gates. Sitemap updated with localized slugs.

### Phase 3: CMS-specific pages

**Goal:** Publish 3 CMS-specific audit pages in both locales.

**Approach:**
- Research each CMS's current compliance landscape before writing (fetch latest docs, check known issues)
- Each page follows the same structure but with CMS-specific content
- Avoid generic advice. Every issue mentioned must be specific to that CMS

**Content template for CMS pages:**

```
## {CMS} and website compliance

Brief overview of {CMS} market share and typical user profile.
Why compliance matters specifically for {CMS} users.

## Known compliance gaps in {CMS}

Specific, documented issues. Not generic "make sure your site is accessible."
Example: "WordPress does not include a cookie consent banner by default.
If your theme loads Google Analytics or Facebook Pixel, these scripts fire
before the visitor consents, which violates ePrivacy requirements."

## Security considerations for {CMS}

CMS-specific security patterns and common vulnerabilities.

## How to audit your {CMS} site

Which Vivotiv scan checks are most relevant for this CMS.
What to look for in the results.

## Run a free {CMS} audit

Scan CTA.
```

**Writing order (market share among Swedish SMBs):**
1. wordpress-website-audit (dominant CMS, ~60% of Swedish SMB sites)
2. squarespace-website-audit (popular for small businesses)
3. wix-website-audit (popular for very small businesses)

**Definition of done:** 3 pages published in both locales. All pass quality gates. Cross-linked to relevant compliance guides.

### Phase 4: Issue explainer pages

**Goal:** Publish 8 issue explainer pages in both locales.

**Approach:**
- Write the 8 pages listed in the Family 4 table
- Each follows a consistent structure (template below)
- Prioritize the pages that map to the strongest scan differentiators first

**Content template for issue explainer pages:**

```
## {First paragraph: plain-language definition that directly answers "what is X."
   Must be self-contained and quotable by AI systems. GEO-optimized.}

## Why it matters for your business

Business impact. Lost visitors, lost revenue, compliance risk, search ranking impact.
Use real numbers where available.

## What a good implementation looks like

Concrete examples. What "passing" looks like vs "failing."
Keep it brief, not a how-to guide.

## How the Vivotiv scan checks this

Which specific checks run. What thresholds are used.
What a pass/warn/fail means for this check.

## Check your website

Scan CTA.
```

**Writing order (highest value first):**
1. what-is-core-web-vitals (umbrella, links to LCP/CLS)
2. what-is-content-security-policy
3. what-is-hsts
4. what-are-security-headers (umbrella for security checks)
5. what-is-lcp
6. what-is-cls
7. what-is-structured-data
8. what-is-robots-txt

**Definition of done:** 8 pages published in both locales. All pass quality gates. Cross-linked to relevant compliance guides. Sitemap updated.

### Phase 5: Comparison and tool pages

**Goal:** Publish 5 comparison pages in both locales.

**Approach:**
- Honest, factual comparisons where Vivotiv is not the main subject
- Acknowledge all tools' strengths fairly
- Position Vivotiv as the answer to gaps neither compared tool covers
- Use SCAN-VS-LIGHTHOUSE.md as source material for Lighthouse-related pages
- Research each compared tool's current capabilities before writing (fetch latest docs)

**Content template for Type A (tool vs tool) pages:**

```
## Quick summary

One paragraph: what each tool does and who it's for.
Comparison table of key differences.

## {Tool A} in detail

What it does well. What it's designed for. Limitations.

## {Tool B} in detail

What it does well. What it's designed for. Limitations.

## Key differences

Specific, factual comparison on the dimensions that matter.

## What neither tool covers

EU trust and compliance checks, unified business scoring, or other gaps
that matter for businesses (not just developers).
Keep this section honest and brief. Not a sales pitch.

## Check your full website health

Scan CTA. One paragraph, contextual.
```

**Content template for Type B (roundup) pages:**

```
## What to look for in a website audit tool

Brief framing of evaluation criteria relevant to the reader's intent.

## {Tool 1}

Strengths, limitations, best for.

## {Tool 2}

(repeat for each tool, including Vivotiv as one entry)

## Comparison table

Side-by-side on key dimensions.

## Which tool fits your needs

Guidance based on priorities. If compliance matters, point to Vivotiv.
If pure performance debugging, point to Lighthouse. Be honest.

## Run a free scan

CTA.
```

**Writing order:**
1. lighthouse-vs-pagespeed-insights (highest search volume)
2. free-website-audit-tools (broad intent, captures tool shoppers)
3. lighthouse-vs-gtmetrix (second most searched comparison)
4. website-audit-tools-eu-compliance (niche but perfectly aligned audience)
5. wave-vs-axe (niche, reinforces accessibility differentiator)

**Definition of done:** 5 pages published in both locales. All pass quality gates. Linked from guides hub.

### Phase 6: Measurement and iteration

**Goal:** Measure what's working and refine.

**Tasks:**

1. **Track content page performance in PostHog**
   - Page views per content page
   - Scan form submissions from content pages (UTM or referrer tracking)
   - Bounce rate and scroll depth

2. **Search Console monitoring**
   - Which pages get impressions and clicks
   - Which queries drive traffic
   - Which pages are indexed
   - Monitor for keyword cannibalization between pages

3. **Content refresh cycle**
   - Review all content pages quarterly
   - Update enforcement data (new IMY decisions, new fine amounts)
   - Update CMS-specific pages when platforms release major changes
   - Update `lastUpdated` frontmatter when content changes
   - Add new pages only when they clear quality gates

4. **Noindex decisions**
   - If a page gets fewer than 10 impressions/month after 3 months, evaluate:
     - Improve content quality
     - Merge into a stronger page
     - Set noindex and redirect

5. **CMS page maintenance**
   - WordPress, Squarespace, and Wix update frequently
   - Set calendar reminders to verify CMS-specific claims quarterly
   - Update known compliance gaps when platforms add/remove features

6. **Expand content based on data**
   - If a family performs well, evaluate adding more pages (more CMS platforms, more problem pages)
   - If a family underperforms, investigate why before adding more pages
   - New pages still require quality gate clearance

---

## Content writing instructions

Use these instructions when generating content pages with AI. Include them as context alongside MARKETING-CONTEXT.md.

### General rules

1. **Read MARKETING-CONTEXT.md first.** Every rule in that document applies to content pages.
2. **Open with the answer.** First paragraph directly answers the target search query. Concise, quotable, standalone. This is the most important paragraph for both SEO and GEO.
3. **Swedish enforcement angle.** Every compliance page references IMY, Swedish fine amounts, or Swedish legal context. The English version can broaden to EU but stays specific.
4. **No em dashes.** Use commas, periods, or parentheses instead.
5. **No AI copy patterns.** No "In today's digital landscape," no "Let's dive in," no "Here's the thing," no dramatic fragment pairs.
6. **Swedish copy uses "Er/er."** Formal address, not "din/du."
7. **Real numbers.** Cite actual fine amounts, actual regulation articles, actual dates. If you can't cite a real number, don't make one up.
8. **Each page stands alone.** Someone lands from search directly on this page. It must make sense without reading anything else first.
9. **Scan CTA is contextual.** "Check if your website meets these requirements" not "Try our amazing tool."
10. **No feature lists longer than 4 items.** Lead with consequences.
11. **Cite authoritative sources.** Link to primary sources (IMY.se, EUR-Lex, W3C) for every legal or regulatory claim. Never cite secondary sources when the primary is available.
12. **Make definitions quotable.** When defining a concept, write one paragraph that fully explains it without requiring surrounding context. AI systems may excerpt just this paragraph.

### Frontmatter template

```yaml
---
title: "Page Title Here"
description: "One or two sentences that work as a meta description. Under 160 characters. Specific, not generic."
lastUpdated: "Last updated {month} {year}"
family: "compliance"  # or "actions", "cms", "checks", "comparisons", "standalone"
relatedChecks: ["check-id-1", "check-id-2"]
relatedSlugs: ["related-page-slug-1", "related-page-slug-2"]
---
```

For Swedish MDX files, add the localized slug:

```yaml
---
title: "Sidtitel här"
description: "En eller två meningar som fungerar som metabeskrivning. Under 160 tecken."
lastUpdated: "Senast uppdaterad {månad} {år}"
family: "compliance"
localeSlug: "svensk-slug-har"
relatedChecks: ["check-id-1", "check-id-2"]
relatedSlugs: ["related-page-slug-1", "related-page-slug-2"]
---
```

### Before writing a new page

1. Check that no existing page covers the same intent (prevent cannibalization)
2. Verify that the page will pass all quality gates
3. Confirm the search intent is real (would a Swedish SMB actually search for this?)
4. Check that enough unique, specific content exists to fill 500+ words without padding
5. Identify authoritative sources to cite before starting

---

## Validation checklist

Run before publishing any content page:

- [ ] Both en.mdx and sv.mdx exist
- [ ] Frontmatter has all required fields (title, description, lastUpdated, family)
- [ ] SV frontmatter includes `localeSlug` with a natural Swedish slug
- [ ] Title is under 60 characters
- [ ] Description is under 160 characters
- [ ] Body content exceeds 500 words
- [ ] First paragraph directly answers the target search query (GEO)
- [ ] At least one scan CTA present
- [ ] At least one internal link to another content page
- [ ] Swedish version uses "Er/er" not "din/du"
- [ ] No em dashes in either locale
- [ ] No AI copy patterns (check MARKETING-CONTEXT.md rules)
- [ ] No placeholders or TODOs
- [ ] Swedish version references Swedish enforcement context
- [ ] Compliance/legal pages cite authoritative primary sources
- [ ] `relatedSlugs` field populated with relevant pages
- [ ] Page appears in guides hub under correct family
- [ ] Page included in sitemap with correct localized slugs and hreflang
- [ ] Frontmatter `lastUpdated` reflects actual content date
- [ ] No keyword cannibalization with existing pages
