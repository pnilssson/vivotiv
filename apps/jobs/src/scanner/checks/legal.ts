import type { Page } from "playwright";
import type { CheckResult } from "@vivotiv/shared";

export interface LegalDomResults {
  checks: CheckResult[];
}

export async function extractLegalDomChecks(
  page: Page,
): Promise<LegalDomResults> {
  const entries: Array<{ id: string; promise: Promise<CheckResult> }> = [
    { id: "cookie-banner", promise: checkCookieBanner(page) },
    { id: "reject-option", promise: checkRejectButton(page) },
    { id: "pre-consent-tracking", promise: checkPreConsentTracking(page) },
    { id: "pre-consent-cookies", promise: checkPreConsentCookies(page) },
    { id: "privacy-policy", promise: checkPrivacyPolicy(page) },
    { id: "cookie-policy", promise: checkCookiePolicy(page) },
    { id: "contact-info", promise: checkContactInfo(page) },
  ];

  const results = await Promise.allSettled(entries.map((e) => e.promise));

  const checks: CheckResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return errorCheck(entries[i].id, String(r.reason));
  });

  return { checks };
}

function errorCheck(id: string, reason: string): CheckResult {
  return {
    id,
    name: id,
    status: "error",
    score: null,
    value: reason,
    rawValue: null,
    rawUnit: null,
    scoreThresholds: null,
    weight: 1,
    description: "Check failed due to an error",
    items: null,
  };
}

// Common consent manager selectors
const BANNER_SELECTORS = [
  // CookieBot
  "#CybotCookiebotDialog",
  // OneTrust
  "#onetrust-banner-sdk",
  // Cookie Consent (Osano's open-source lib)
  ".cc-banner",
  // Usercentrics (Shadow DOM - also checked via piercing selector below)
  "#usercentrics-root",
  "#uc-banner-modal",
  // Didomi
  "#didomi-popup",
  "#didomi-notice",
  // CookieYes
  "#cookie-law-info-bar",
  ".cky-consent-container",
  // Complianz
  "#cmplz-cookiebanner-container",
  // Quantcast
  ".qc-cmp2-container",
  "#qcCmpUi",
  // iubenda
  "#iubenda-cs-banner",
  // Klaro
  "#klaro",
  ".klaro",
  // TrustArc
  "#truste-consent-track",
  ".truste_overlay",
  // Cookie Script
  "#cookiescript_injected",
  // Osano
  ".osano-cm-dialog",
  // Termly
  "#termly-code-snippet-support",
  ".t-consentPrompt",
  // Axeptio
  "#axeptio_overlay",
  // Generic patterns
  "#cookie-consent",
  "#cookie-banner",
  "#gdpr-banner",
  "#consent-banner",
  '[class*="cookie-banner"]',
  '[class*="cookie-consent"]',
  '[class*="consent-banner"]',
  '[id*="cookie-banner"]',
  '[id*="cookie-consent"]',
  '[id*="consent-banner"]',
  '[aria-label*="cookie"]',
  '[aria-label*="consent"]',
];

// Shadow DOM CMP selectors using Playwright piercing combinator
const SHADOW_BANNER_SELECTORS = [
  "#usercentrics-root >> #uc-center-container",
  "#usercentrics-root >> [data-testid='uc-banner-modal']",
];

const SHADOW_REJECT_SELECTORS = [
  "#usercentrics-root >> [data-testid='uc-deny-all-button']",
];

async function detectCookieBanner(page: Page): Promise<
  | "selector"
  | "shadow-dom"
  | "text"
  | null
> {
  for (const selector of BANNER_SELECTORS) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      return "selector";
    }
  }

  for (const selector of SHADOW_BANNER_SELECTORS) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        return "shadow-dom";
      }
    } catch {
      // Piercing selector may fail if host element absent.
    }
  }

  const hasCookieText = await page.evaluate(() => {
    const keywords = [
      "cookie",
      "kakor",
      "samtycke",
      "consent",
      "gdpr",
      "integritet",
    ];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent?.toLowerCase() ?? "";
      if (
        keywords.some((kw) => text.includes(kw)) &&
        text.length < 500 &&
        text.length > 10
      ) {
        const el = node.parentElement;
        if (el) {
          const style = window.getComputedStyle(el);
          const isFixed =
            style.position === "fixed" || style.position === "sticky";
          const parent = el.closest(
            '[style*="position: fixed"], [style*="position: sticky"], [class*="fixed"], [class*="sticky"]',
          );
          if (isFixed || parent) return true;
        }
      }
    }
    return false;
  });

  return hasCookieText ? "text" : null;
}

async function checkCookieBanner(page: Page): Promise<CheckResult> {
  const bannerDetection = await detectCookieBanner(page);

  if (bannerDetection === "selector") {
    return buildCheck(
      "cookie-banner",
      "Cookie Consent Banner",
      "pass",
      "Banner detected",
      3,
      "A cookie consent banner is required by the ePrivacy Directive and GDPR before setting non-essential cookies.",
    );
  }

  if (bannerDetection === "shadow-dom") {
    return buildCheck(
      "cookie-banner",
      "Cookie Consent Banner",
      "pass",
      "Banner detected (Shadow DOM)",
      3,
      "A cookie consent banner is required by the ePrivacy Directive and GDPR before setting non-essential cookies.",
    );
  }

  if (bannerDetection === "text") {
    return buildCheck(
      "cookie-banner",
      "Cookie Consent Banner",
      "pass",
      "Banner detected (text match)",
      3,
      "A cookie consent banner is required by the ePrivacy Directive and GDPR before setting non-essential cookies.",
    );
  }

  return buildCheck(
    "cookie-banner",
    "Cookie Consent Banner",
    "fail",
    "No cookie consent banner found",
    3,
    "A cookie consent banner is required by the ePrivacy Directive and GDPR before setting non-essential cookies.",
  );
}

const REJECT_SELECTORS = [
  // CookieBot
  "#CybotCookiebotDialogBodyButtonDecline",
  // OneTrust
  "#onetrust-reject-all-handler",
  // Usercentrics
  'button[data-testid="uc-deny-all-button"]',
  // Didomi
  "#didomi-notice-disagree-button",
  // CookieYes
  ".cky-btn-reject",
  // Complianz
  ".cmplz-deny",
  // Generic patterns
  'button[class*="reject"]',
  'button[class*="decline"]',
  'button[class*="deny"]',
  'a[class*="reject"]',
  'a[class*="decline"]',
  'a[class*="deny"]',
];

const REJECT_TEXT_PATTERNS = [
  "reject all",
  "decline all",
  "deny all",
  "refuse all",
  "avvisa alla",
  "neka alla",
  "bara nödvändiga",
  "only necessary",
  "only essential",
  "reject",
  "decline",
  "avvisa",
  "neka",
];

async function checkRejectButton(page: Page): Promise<CheckResult> {
  // Check known reject button selectors
  for (const selector of REJECT_SELECTORS) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      return buildCheck(
        "reject-option",
        "Cookie Reject Option",
        "pass",
        "Reject button found",
        2,
        "A clearly visible 'Reject all' option must be equally prominent as 'Accept all' per IMY enforcement guidelines.",
      );
    }
  }

  // Check Shadow DOM CMPs
  for (const selector of SHADOW_REJECT_SELECTORS) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        return buildCheck(
          "reject-option",
          "Cookie Reject Option",
          "pass",
          "Reject button found (Shadow DOM)",
          2,
          "A clearly visible 'Reject all' option must be equally prominent as 'Accept all' per IMY enforcement guidelines.",
        );
      }
    } catch {
      // Piercing selector may fail if host element absent
    }
  }

  // Search for buttons/links with reject-like text
  const found = await page.evaluate((patterns: string[]) => {
    const buttons = document.querySelectorAll("button, a, [role='button']");
    for (const btn of buttons) {
      const text = btn.textContent?.toLowerCase().trim() ?? "";
      if (patterns.some((p) => text.includes(p))) return true;
    }
    return false;
  }, REJECT_TEXT_PATTERNS);

  if (found) {
    return buildCheck(
      "reject-option",
      "Cookie Reject Option",
      "pass",
      "Reject option found",
      2,
      "A clearly visible 'Reject all' option must be equally prominent as 'Accept all' per IMY enforcement guidelines.",
    );
  }

  return buildCheck(
    "reject-option",
    "Cookie Reject Option",
    "fail",
    "No reject/decline option found",
    2,
    "A clearly visible 'Reject all' option must be equally prominent as 'Accept all' per IMY enforcement guidelines.",
  );
}

const TRACKING_PATTERNS = [
  // Google Analytics / Tag Manager
  "google-analytics.com",
  "googletagmanager.com",
  "gtag/js",
  "analytics.js",
  "ga.js",
  // Google Ads
  "googleadservices.com",
  "googlesyndication.com",
  // DoubleClick
  "doubleclick.net",
  // Meta / Facebook
  "connect.facebook.net",
  "fbevents.js",
  "fbq(",
  // Microsoft
  "hotjar.com",
  "clarity.ms",
  // TikTok
  "analytics.tiktok.com",
  // LinkedIn
  "snap.licdn.com",
  // Pinterest
  "ct.pinterest.com",
  // Snapchat
  "sc-static.net/scevent.min.js",
  // Reddit
  "alb.reddit.com",
  // Twitter/X
  "static.ads-twitter.com",
  // HubSpot
  "js.hs-scripts.com",
  "js.hs-analytics.com",
  // Segment
  "cdn.segment.com",
  // Mixpanel
  "cdn.mxpnl.com",
  // Amplitude
  "cdn.amplitude.com",
  // FullStory
  "fullstory.com/s/fs.js",
];

// Scripts blocked by type attribute are CMP-managed (compliant)
const BLOCKED_SCRIPT_TYPES = [
  "text/plain",
  "text/template",
  "application/json",
  "text/x-custom",
  "text/x-cookieconsent",
  "application/blocked",
];

const BLOCKING_ATTRIBUTE_PATTERNS = [
  "data-cookieconsent",
  "data-consent",
  "data-purpose",
  "data-category",
  "data-cmplz",
  "data-ot-ignore",
];

type TrackingDetection = {
  active: string[];
  blocked: string[];
};

async function detectTrackingScripts(page: Page): Promise<TrackingDetection> {
  return page.evaluate(
    ({ patterns, blockedTypes, blockingAttributes }) => {
      const active: string[] = [];
      const blocked: string[] = [];

      const isBlocked = (script: HTMLScriptElement): boolean => {
        const scriptType = script.getAttribute("type")?.toLowerCase().trim() ?? "";
        if (
          blockedTypes.some(
            (blockedType) =>
              scriptType === blockedType || scriptType.startsWith(`${blockedType};`),
          )
        ) {
          return true;
        }

        for (const attrName of script.getAttributeNames()) {
          if (
            blockingAttributes.some((attr) => attrName.toLowerCase().includes(attr))
          ) {
            return true;
          }
        }

        const dataCookieConsent =
          script.getAttribute("data-cookieconsent")?.toLowerCase() ?? "";
        if (dataCookieConsent && dataCookieConsent !== "ignore") {
          return true;
        }

        return false;
      };

      const addMatch = (value: string, blockedScript: boolean) => {
        if (blockedScript) blocked.push(value);
        else active.push(value);
      };

      for (const script of document.querySelectorAll("script[src]")) {
        const htmlScript = script as HTMLScriptElement;
        const src = script.getAttribute("src") ?? "";
        const blockedScript = isBlocked(htmlScript);
        for (const pattern of patterns) {
          if (src.includes(pattern)) {
            addMatch(src, blockedScript);
            break;
          }
        }
      }

      for (const script of document.querySelectorAll("script:not([src])")) {
        const htmlScript = script as HTMLScriptElement;
        const content = script.textContent ?? "";
        const blockedScript = isBlocked(htmlScript);
        for (const pattern of patterns) {
          if (content.includes(pattern)) {
            addMatch(`Inline script: ${pattern}`, blockedScript);
            break;
          }
        }
      }

      return {
        active: [...new Set(active)],
        blocked: [...new Set(blocked)],
      };
    },
    {
      patterns: TRACKING_PATTERNS,
      blockedTypes: BLOCKED_SCRIPT_TYPES,
      blockingAttributes: BLOCKING_ATTRIBUTE_PATTERNS,
    },
  );
}

async function checkPreConsentTracking(page: Page): Promise<CheckResult> {
  const [trackingScripts, bannerDetection] = await Promise.all([
    detectTrackingScripts(page),
    detectCookieBanner(page),
  ]);

  if (trackingScripts.active.length === 0 && trackingScripts.blocked.length === 0) {
    return buildCheck(
      "pre-consent-tracking",
      "Pre-Consent Tracking",
      "pass",
      "No tracking scripts detected before consent",
      3,
      "Loading tracking scripts before obtaining user consent is a GDPR violation. Fines up to 4% of global turnover.",
    );
  }

  if (trackingScripts.active.length === 0 && trackingScripts.blocked.length > 0) {
    return buildCheck(
      "pre-consent-tracking",
      "Pre-Consent Tracking",
      "pass",
      `${trackingScripts.blocked.length} tracking script${trackingScripts.blocked.length === 1 ? "" : "s"} present but blocked until consent`,
      3,
      "Tracking scripts can be present in HTML if they are blocked by the CMP and only activated after consent.",
      trackingScripts.blocked.slice(0, 10),
    );
  }

  if (trackingScripts.active.length > 0 && !bannerDetection) {
    return buildCheck(
      "pre-consent-tracking",
      "Pre-Consent Tracking",
      "fail",
      `${trackingScripts.active.length} active tracking script${trackingScripts.active.length === 1 ? "" : "s"} and no consent banner detected`,
      3,
      "Loading tracking scripts before obtaining user consent is a GDPR violation. Fines up to 4% of global turnover.",
      trackingScripts.active.slice(0, 10),
    );
  }

  return buildCheck(
    "pre-consent-tracking",
    "Pre-Consent Tracking",
    "fail",
    `${trackingScripts.active.length} tracking script${trackingScripts.active.length === 1 ? "" : "s"} loaded before consent`,
    3,
    "Loading tracking scripts before obtaining user consent is a GDPR violation. Fines up to 4% of global turnover.",
    trackingScripts.active.slice(0, 10),
  );
}

const TRACKING_COOKIE_PATTERNS = [
  /^_ga/,
  /^_gid$/,
  /^_gat/,
  /^_fbp$/,
  /^_fbc$/,
  /^_hj/,
  /^_clck$/,
  /^_clsk$/,
  /^_uet/,
  /^fr$/,
  /^IDE$/,
  /^test_cookie$/,
  /^bcookie$/,
  /^li_.*/,
  /^ajs_.*/,
  /^mp_.*/,
  /^amplitude_id_.*/,
];

async function checkPreConsentCookies(page: Page): Promise<CheckResult> {
  const cookies = await page.context().cookies();

  const trackingCookies = cookies
    .filter((cookie) =>
      TRACKING_COOKIE_PATTERNS.some((pattern) => pattern.test(cookie.name)),
    )
    .map((cookie) => `${cookie.name} (${cookie.domain})`);

  if (trackingCookies.length === 0) {
    return buildCheck(
      "pre-consent-cookies",
      "Pre-Consent Cookies",
      "pass",
      "No known tracking cookies detected",
      3,
      "Dropping non-essential tracking cookies before consent is a GDPR/ePrivacy violation.",
    );
  }

  return buildCheck(
    "pre-consent-cookies",
    "Pre-Consent Cookies",
    "fail",
    `${trackingCookies.length} tracking cookie${trackingCookies.length === 1 ? "" : "s"} set before consent`,
    3,
    "Dropping non-essential tracking cookies before consent is a GDPR/ePrivacy violation.",
    trackingCookies.slice(0, 10),
  );
}

const PRIVACY_LINK_PATTERNS = [
  "privacy",
  "integritet",
  "personuppgift",
  "dataskydd",
  "gdpr",
  "privacy-policy",
  "privacy_policy",
];

async function checkPrivacyPolicy(page: Page): Promise<CheckResult> {
  const found = await page.evaluate((patterns: string[]) => {
    for (const link of document.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href")?.toLowerCase() ?? "";
      const text = link.textContent?.toLowerCase() ?? "";
      if (
        patterns.some((p) => href.includes(p) || text.includes(p))
      ) {
        return true;
      }
    }
    return false;
  }, PRIVACY_LINK_PATTERNS);

  if (found) {
    return buildCheck(
      "privacy-policy",
      "Privacy Policy",
      "pass",
      "Privacy policy link found",
      2,
      "A link to the privacy policy is required by GDPR Articles 13 and 14.",
    );
  }

  return buildCheck(
    "privacy-policy",
    "Privacy Policy",
    "fail",
    "No privacy policy link found",
    2,
    "A link to the privacy policy is required by GDPR Articles 13 and 14.",
  );
}

const COOKIE_POLICY_PATTERNS = [
  "cookie-policy",
  "cookie_policy",
  "cookiepolicy",
  "cookies",
  "kakor",
  "kakpolicy",
  "cookie policy",
];

async function checkCookiePolicy(page: Page): Promise<CheckResult> {
  const found = await page.evaluate((patterns: string[]) => {
    for (const link of document.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href")?.toLowerCase() ?? "";
      const text = link.textContent?.toLowerCase() ?? "";
      if (
        patterns.some((p) => href.includes(p) || text.includes(p))
      ) {
        return true;
      }
    }
    return false;
  }, COOKIE_POLICY_PATTERNS);

  if (found) {
    return buildCheck(
      "cookie-policy",
      "Cookie Policy",
      "pass",
      "Cookie policy link found",
      1,
      "A cookie policy explaining what cookies are used and why is required by the ePrivacy Directive.",
    );
  }

  return buildCheck(
    "cookie-policy",
    "Cookie Policy",
    "warn",
    "No dedicated cookie policy link found",
    1,
    "A cookie policy explaining what cookies are used and why is required by the ePrivacy Directive.",
  );
}

async function checkContactInfo(page: Page): Promise<CheckResult> {
  const found = await page.evaluate(() => {
    const body = document.body.textContent?.toLowerCase() ?? "";

    // Look for common contact indicators
    const contactPatterns = [
      "organisationsnummer",
      "org.nr",
      "org nr",
      "corporate identity",
      "vat number",
      "moms",
    ];

    // Swedish org number with nearby context text to reduce false positives.
    const contextualOrgPattern =
      /(organisationsnummer|org\.?\s*nr|corporate identity|vat number|moms)[^\n\r]{0,40}\b\d{6}[-\s]?\d{4}\b/i;
    const contextualOrgPatternReverse =
      /\b\d{6}[-\s]?\d{4}\b[^\n\r]{0,24}(organisationsnummer|org\.?\s*nr|corporate identity|vat number|moms)/i;

    if (contextualOrgPattern.test(body) || contextualOrgPatternReverse.test(body)) {
      return "org-number";
    }

    if (contactPatterns.some((p) => body.includes(p))) return "contact-text";

    // Check footer specifically for address-like patterns
    const footer =
      document.querySelector("footer")?.textContent?.toLowerCase() ?? "";
    const addressPatterns = [
      /\d{3}\s?\d{2}\s+\w/,    // Swedish postal code: 123 45 City
      /\b[a-zåäö]+gatan\b/i,   // Street names ending in -gatan
      /\b[a-zåäö]+vägen\b/i,   // Street names ending in -vägen
    ];
    if (addressPatterns.some((p) => p.test(footer))) return "address";

    return null;
  });

  if (found) {
    return buildCheck(
      "contact-info",
      "Business Contact Information",
      "pass",
      `Contact information found (${found})`,
      1,
      "Swedish law (Lag om elektronisk handel) requires visible business identification on commercial websites.",
    );
  }

  return buildCheck(
    "contact-info",
    "Business Contact Information",
    "warn",
    "No business identification found",
    1,
    "Swedish law (Lag om elektronisk handel) requires visible business identification on commercial websites.",
  );
}

function buildCheck(
  id: string,
  name: string,
  status: "pass" | "warn" | "fail",
  value: string,
  weight: 1 | 2 | 3,
  description: string,
  items: string[] | null = null,
): CheckResult {
  return {
    id,
    name,
    status,
    score: status === "pass" ? 100 : status === "warn" ? 50 : 0,
    value,
    rawValue: null,
    rawUnit: null,
    scoreThresholds: null,
    weight,
    description,
    items,
  };
}
