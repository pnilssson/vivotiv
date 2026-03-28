# SEO Audit & Implementation Plan

## Context

Vivotiv is a single-page landing site (Next.js 16.2.1 + next-intl 4.8.3) serving two domains: vivotiv.com (English) and vivotiv.se (Swedish). The site is a lead-gen tool for a free website scan targeting Swedish SMBs. Currently, the site has **zero SEO infrastructure**: no proxy (Next.js 16 renamed middleware.ts to proxy.ts), no sitemap, no robots.txt, no structured data, no Open Graph tags, no canonical URLs, and only a generic hardcoded metadata setup. This plan addresses every gap.

---

## Findings by Priority

### CRITICAL (Blocking indexation/ranking)

| # | Issue | Impact |
|---|-------|--------|
| 1 | **No `proxy.ts`** (Next.js 16 replacement for middleware.ts). next-intl domain routing, locale detection, and hreflang alternate link headers all require this. Without it, Google can't associate vivotiv.com and vivotiv.se as localized versions of the same page. | Duplicate content risk, no locale signals to Google |
| 2 | **No `robots.ts`** - No robots.txt means no sitemap reference and no crawl directives | Google has no guidance on crawling |
| 3 | **No `sitemap.ts`** - No XML sitemap means Google relies solely on crawling to discover pages | Slower/incomplete indexation |
| 4 | **Generic metadata** - Root layout has `title: "Vivotiv"` and `description: "Free website scan"`. No locale-aware metadata, no proper descriptions | Poor SERP appearance, low CTR |
| 5 | **No canonical URLs** - No canonical tags configured anywhere | Duplicate content risk across .com/.se |
| 6 | **No Open Graph / Twitter meta tags** - Zero social sharing metadata | No preview when shared on social/chat |

### HIGH (Major ranking impact)

| # | Issue | Impact |
|---|-------|--------|
| 7 | **No structured data (JSON-LD)** - No Organization, WebSite, FAQPage schema. Pages with stacked Schema get 3.1x higher AI citation rates in 2026 | Missing rich snippets, poor AI Overview visibility |
| 8 | **No `not-found.tsx`** - No custom 404 page | Bad UX, missed opportunity to redirect users back |
| 9 | **All landing components are `"use client"`** - Every section is a client component (for Motion animations). Googlebot renders JS but with delays; content may be indexed later or incompletely | Crawlability risk for key content |
| 10 | **No security/performance headers in `next.config.ts`** - No X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or caching headers | Missing technical SEO signals |

### MEDIUM (Optimization opportunities)

| # | Issue | Impact |
|---|-------|--------|
| 11 | **No web app manifest** - Missing PWA metadata | Minor ranking signal, no "Add to Home" |
| 12 | **Public folder has only default Next.js placeholder SVGs** - No favicon, no OG image | No favicon in browser tabs, no social preview image |
| 13 | **Footer privacy link uses `<a href="/privacy">`** - Plain anchor, not next-intl `Link`, and no /privacy page exists | Broken link (404), bad for crawlers |
| 14 | **Language switcher is client-side only (button + onClick)** - Not crawlable; however proxy.ts hreflang headers will fix the SEO side | Google can't discover alternate language via DOM |
| 15 | **FAQ uses `<details>` elements** - Content inside closed `<details>` may be deprioritized by Google | FAQ content may not appear in search |

### LOW (Polish)

| # | Issue | Impact |
|---|-------|--------|
| 16 | **No `loading.tsx` or Suspense boundaries** | Minor CWV impact |
| 17 | **3 font families loaded** (Geist, Geist Mono, Space Grotesk) | Potential LCP impact |

---

## Implementation Plan

### Task 1: Add `proxy.ts` (next-intl locale routing + hreflang)
**File:** `apps/web/src/proxy.ts`

In Next.js 16, `middleware.ts` is deprecated and renamed to `proxy.ts`. The file goes in `src/` (same level as `app/`). The named export must be `proxy` or a default export.

Since next-intl's `createMiddleware` returns a function, we use it as a default export:

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)" ],
};
```

This enables:
- Domain-based locale detection (vivotiv.com -> en, vivotiv.se -> sv)
- `hreflang` alternate link headers in HTTP responses
- Locale cookie handling
- Redirect for unsupported locale/domain combos

### Task 2: Add locale-aware metadata with `generateMetadata`
**Files:**
- `apps/web/src/app/[locale]/layout.tsx` - add `generateMetadata`
- `apps/web/src/app/layout.tsx` - remove static `metadata` export (move to locale layout)
- `apps/web/messages/en.json` - add `metadata` keys
- `apps/web/messages/sv.json` - add `metadata` keys

The `generateMetadata` function in the locale layout will:
- Set locale-specific `title` and `description` from translation messages
- Add `alternates.canonical` (self-referencing canonical URL per domain)
- Add `alternates.languages` for hreflang (`en` -> vivotiv.com, `sv` -> vivotiv.se)
- Set `openGraph` tags (title, description, url, siteName, locale, type)
- Set `twitter` card metadata (summary_large_image)
- Set `robots` index/follow directives with Googlebot `max-image-preview: large`

Add to `en.json`:
```json
"metadata": {
  "title": "Free Website Scan | Vivotiv",
  "description": "Find out what's wrong with your website in 60 seconds. Check performance, SEO, accessibility, GDPR compliance, and security for free."
}
```

Add to `sv.json`:
```json
"metadata": {
  "title": "Gratis webbplatsanalys | Vivotiv",
  "description": "Ta reda på vad som är fel med din webbplats på 60 sekunder. Kontrollera prestanda, SEO, tillgänglighet, GDPR-efterlevnad och säkerhet gratis."
}
```

### Task 3: Add `robots.ts`
**File:** `apps/web/src/app/robots.ts`

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: [
      "https://vivotiv.com/sitemap.xml",
      "https://vivotiv.se/sitemap.xml",
    ],
  };
}
```

### Task 4: Add `sitemap.ts`
**File:** `apps/web/src/app/sitemap.ts`

Generate entries for both domains. Currently just the homepage per domain, structured for easy future expansion:

```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://vivotiv.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          sv: "https://vivotiv.se",
        },
      },
    },
    {
      url: "https://vivotiv.se",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: "https://vivotiv.com",
        },
      },
    },
  ];
}
```

### Task 5: Add structured data (JSON-LD)
**File:** `apps/web/src/app/[locale]/page.tsx`

Add three JSON-LD schemas via `<script type="application/ld+json" dangerouslySetInnerHTML>`:

1. **Organization** - name, url, description
2. **WebSite** - name, url, inLanguage
3. **FAQPage** - all 5 FAQ items pulled from translations

The FAQ schema is particularly valuable: it can trigger FAQ rich snippets in Google search results AND increases AI Overview citation probability.

Since the page component is a Server Component, this renders in the initial HTML and is immediately visible to crawlers.

### Task 6: Add custom 404 page
**File:** `apps/web/src/app/[locale]/not-found.tsx`

Simple not-found page with:
- Translated heading and message
- Link back to homepage using next-intl `Link`

Add `notFound` keys to both `en.json` and `sv.json`.

### Task 7: Add security & caching headers
**File:** `apps/web/next.config.ts`

Add `headers` function to the Next.js config:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Task 8: Fix broken privacy link in footer
**File:** `apps/web/src/features/landing/components/site-footer.tsx`

Replace `<a href="/privacy">` with next-intl `Link` component from `@/i18n/navigation`.

### Task 9: Clean up default public assets
**File:** `apps/web/public/`

Remove unused default Next.js SVGs: file.svg, globe.svg, next.svg, vercel.svg, window.svg.

### Task 10: Add web app manifest
**File:** `apps/web/src/app/manifest.ts`

Basic manifest with app name, theme color, background color.

---

## Privacy, Cookie Policy & Cookie Banner

Vivotiv needs GDPR-compliant privacy and cookie policies plus a cookie consent banner. Adapted from the distillr implementation pattern, but simplified for Vivotiv's current state (no analytics, no auth, no payment processing yet). These pages need to be bilingual (English + Swedish) via next-intl.

### Current state

- Footer links to `/privacy` but the page doesn't exist (404)
- No cookie banner
- No cookie policy
- The only cookie currently set is the next-intl `NEXT_LOCALE` cookie (strictly necessary for locale routing)
- No analytics, no auth cookies, no third-party tracking

### What to implement

#### Task 11: Privacy Policy page
**File:** `apps/web/src/app/[locale]/(legal)/privacy/page.tsx`
**File:** `apps/web/src/app/[locale]/(legal)/layout.tsx`

Create a `(legal)` route group with a clean layout (back link to homepage, max-w-3xl centered content). The privacy policy should cover:

1. **Data Controller** - Vivotiv (enskild firma / company name), contact email
2. **What Data We Collect**
   - Lead data: email address and website URL submitted via the scan form
   - Stored in Supabase (EU region)
   - No passwords (no auth yet)
3. **Legal Basis** - Consent (Art. 6(1)(a)) for storing the lead/email, legitimate interest for error monitoring
4. **Data Processors**
   - Supabase (database, EU)
   - Vercel (hosting, US/EU)
   - one.com SMTP (transactional email, EU)
5. **International Data Transfers** - Vercel US presence, SCCs relied upon
6. **Data Retention** - Lead data retained until deletion request
7. **Your Rights** - Access, rectification, erasure, restriction, portability, objection, withdraw consent
8. **Supervisory Authority** - IMY (imy.se)
9. **Changes to Policy** - Will update "Last updated" date
10. **Contact** - Email address

Metadata: `robots: { index: false }` (legal pages shouldn't rank)

All content translated in `en.json` and `sv.json` under a `privacy` key.

#### Task 12: Cookie Policy page
**File:** `apps/web/src/app/[locale]/(legal)/cookies/page.tsx`

Covers:

1. **What are cookies** - Plain language explanation
2. **Cookies we use**
   - Strictly Necessary: `NEXT_LOCALE` (next-intl locale preference, session)
   - No analytics cookies currently
3. **Third-party services** - None currently setting cookies
4. **Managing preferences** - Browser settings, cookie preferences link
5. **Contact** - Email address

All content translated under a `cookiePolicy` key.

#### Task 13: Cookie Consent Banner
**Files:**
- `apps/web/src/features/cookies/cookie-consent-provider.tsx`
- `apps/web/src/features/cookies/cookie-banner.tsx`
- `apps/web/src/features/cookies/cookie-preferences-dialog.tsx`

Adapted from distillr's implementation with these changes:

**CookieConsentProvider:**
- Same localStorage-based consent state pattern (`vivotiv-cookie-consent`)
- Consent version tracking for future re-consent on policy changes
- No PostHog integration (remove `applyPosthogConsent`). Keep the `analytics` boolean in the consent shape so it's ready when analytics is added later
- Stores consent timestamp for GDPR audit trail

**CookieBanner:**
- Fixed bottom-right dialog, same as distillr
- Three buttons: "Reject all", "Manage preferences", "Accept all" (GDPR-compliant equal prominence)
- Links to `/cookies` policy page
- Copy adjusted: "We use cookies to remember your language preference. No tracking without your consent."
- Uses Motion (not framer-motion) for animations to match Vivotiv's stack
- Uses next-intl `Link` for the cookie policy link
- All text translated via next-intl

**CookiePreferencesDialog:**
- Uses shadcn Dialog (already in Vivotiv's deps)
- "Strictly Necessary" toggle (always on, disabled) for `NEXT_LOCALE`
- "Analytics" toggle (off by default, placeholder for when PostHog is added)
- Save/Cancel buttons

**Integration:**
- Wrap in root layout (`apps/web/src/app/layout.tsx`) or locale layout
- Banner renders on every page until user makes a choice

#### Task 14: Update footer links
**File:** `apps/web/src/features/landing/components/site-footer.tsx`

- Add "Cookie Policy" link next to "Privacy Policy"
- Add "Cookie Preferences" button that opens the preferences dialog
- Both links use next-intl `Link`
- Add footer translation keys to both message files

---

## Out of Scope (noted for future)

- **OG image / favicon design** - Requires brand assets. Placeholder can be generated but real branding is needed.
- **Server Components refactor** - Moving sections from `"use client"` to Server Components would improve crawlability but requires rethinking Motion animations. Larger effort.
- **Blog / content pages** - For GEO/AI visibility, Vivotiv needs content targeting Swedish SMB website problems. The brief says "not yet."
- **Programmatic SEO** - Comparison pages, industry pages, local pages for Swedish cities.
- **Analytics integration** - When PostHog is added, wire it into the CookieConsentProvider (same pattern as distillr).

---

## Key Files

| File | Action |
|------|--------|
| `apps/web/src/proxy.ts` | **Create** - next-intl locale routing |
| `apps/web/src/app/layout.tsx` | **Edit** - remove static metadata, add CookieConsentProvider + CookieBanner |
| `apps/web/src/app/[locale]/layout.tsx` | **Edit** - add generateMetadata |
| `apps/web/src/app/[locale]/page.tsx` | **Edit** - add JSON-LD structured data |
| `apps/web/src/app/[locale]/not-found.tsx` | **Create** - custom 404 |
| `apps/web/src/app/[locale]/(legal)/layout.tsx` | **Create** - legal pages layout |
| `apps/web/src/app/[locale]/(legal)/privacy/page.tsx` | **Create** - privacy policy |
| `apps/web/src/app/[locale]/(legal)/cookies/page.tsx` | **Create** - cookie policy |
| `apps/web/src/app/robots.ts` | **Create** |
| `apps/web/src/app/sitemap.ts` | **Create** |
| `apps/web/src/app/manifest.ts` | **Create** |
| `apps/web/next.config.ts` | **Edit** - add security headers |
| `apps/web/messages/en.json` | **Edit** - add metadata, notFound, privacy, cookiePolicy, cookies keys |
| `apps/web/messages/sv.json` | **Edit** - add metadata, notFound, privacy, cookiePolicy, cookies keys |
| `apps/web/src/features/cookies/cookie-consent-provider.tsx` | **Create** - consent state management |
| `apps/web/src/features/cookies/cookie-banner.tsx` | **Create** - GDPR cookie banner |
| `apps/web/src/features/cookies/cookie-preferences-dialog.tsx` | **Create** - preferences dialog |
| `apps/web/src/features/landing/components/site-footer.tsx` | **Edit** - fix Link, add cookie policy + preferences links |
| `apps/web/public/*.svg` | **Delete** - remove 5 default SVGs |

---

## Verification

1. `pnpm build` in apps/web succeeds with no errors
2. `/sitemap.xml` returns valid XML with both domain URLs and alternates
3. `/robots.txt` returns valid directives with sitemap references
4. View page source: check `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<link rel="alternate" hreflang>`, OG tags, Twitter cards
5. View page source: check for 3 JSON-LD `<script>` blocks (Organization, WebSite, FAQPage)
6. `/nonexistent-page` shows custom 404 with link home
7. Response headers include security headers (DevTools > Network)
8. Lighthouse SEO audit: target 100/100
9. `/privacy` renders the privacy policy in the correct locale
10. `/cookies` renders the cookie policy in the correct locale
11. Cookie banner appears on first visit, disappears after Accept/Reject
12. "Cookie Preferences" footer link reopens the preferences dialog
13. Consent choice persists in localStorage across page reloads
