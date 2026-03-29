import type { Page } from "playwright";
import type { CheckResult } from "@vivotiv/shared";

export interface LegalDomResults {
  checks: CheckResult[];
}

export async function extractLegalDomChecks(
  page: Page,
): Promise<LegalDomResults> {
  const results = await Promise.allSettled([
    checkCookieBanner(page),
    checkRejectButton(page),
    checkPreConsentTracking(page),
    checkPrivacyPolicy(page),
    checkCookiePolicy(page),
    checkContactInfo(page),
  ]);

  const checks = results
    .filter(
      (r): r is PromiseFulfilledResult<CheckResult> => r.status === "fulfilled",
    )
    .map((r) => r.value);

  return { checks };
}

// Common consent manager selectors
const BANNER_SELECTORS = [
  "#CybotCookiebotDialog",
  "#onetrust-banner-sdk",
  ".cc-banner",
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

async function checkCookieBanner(page: Page): Promise<CheckResult> {
  // Check known selectors
  for (const selector of BANNER_SELECTORS) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      return buildCheck(
        "cookie-banner",
        "Cookie Consent Banner",
        "pass",
        "Banner detected",
        3,
        "A cookie consent banner is required by the ePrivacy Directive and GDPR before setting non-essential cookies.",
      );
    }
  }

  // Fallback: look for elements containing cookie/consent text
  const hasCookieText = await page.evaluate(() => {
    const keywords = [
      "cookie",
      "kakor",
      "samtycke",
      "consent",
      "gdpr",
      "integritet",
    ];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
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

  if (hasCookieText) {
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
  "#CybotCookiebotDialogBodyButtonDecline",
  "#onetrust-reject-all-handler",
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
  "google-analytics.com",
  "googletagmanager.com",
  "gtag/js",
  "analytics.js",
  "ga.js",
  "connect.facebook.net",
  "fbevents.js",
  "fbq(",
  "hotjar.com",
  "clarity.ms",
  "plausible.io",
  "matomo",
];

async function checkPreConsentTracking(page: Page): Promise<CheckResult> {
  const trackingScripts = await page.evaluate((patterns: string[]) => {
    const found: string[] = [];

    // Check script tags with src
    for (const script of document.querySelectorAll("script[src]")) {
      const src = script.getAttribute("src") ?? "";
      for (const pattern of patterns) {
        if (src.includes(pattern)) {
          found.push(src);
          break;
        }
      }
    }

    // Check inline scripts for tracking function calls
    for (const script of document.querySelectorAll(
      "script:not([src])",
    )) {
      const content = script.textContent ?? "";
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          found.push(`Inline script: ${pattern}`);
          break;
        }
      }
    }

    return found;
  }, TRACKING_PATTERNS);

  if (trackingScripts.length === 0) {
    return buildCheck(
      "pre-consent-tracking",
      "Pre-Consent Tracking",
      "pass",
      "No tracking scripts detected before consent",
      3,
      "Loading tracking scripts before obtaining user consent is a GDPR violation. Fines up to 4% of global turnover.",
    );
  }

  return buildCheck(
    "pre-consent-tracking",
    "Pre-Consent Tracking",
    "fail",
    `${trackingScripts.length} tracking script${trackingScripts.length === 1 ? "" : "s"} loaded before consent`,
    3,
    "Loading tracking scripts before obtaining user consent is a GDPR violation. Fines up to 4% of global turnover.",
    trackingScripts.slice(0, 10),
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

    // Swedish org number: XXXXXX-XXXX or XXXXXXXXXX
    const orgNumberPattern = /\b\d{6}-?\d{4}\b/;
    if (orgNumberPattern.test(body)) return "org-number";

    // Look for common contact indicators
    const contactPatterns = [
      "organisationsnummer",
      "org.nr",
      "org nr",
      "corporate identity",
      "vat number",
      "moms",
    ];
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
