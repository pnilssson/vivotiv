import * as Sentry from "@sentry/node";
import { chromium } from "playwright";
import type { CheckResult } from "@vivotiv/shared";

import {
  extractAccessibilityChecks,
  type AccessibilityResults,
} from "./checks/accessibility";
import {
  extractLegalDomChecks,
  type LegalDomResults,
} from "./checks/legal";
import { extractSeoDomChecks, type SeoDomResults } from "./checks/seo-dom";
import {
  extractStandardsDomChecks,
  type StandardsDomResults,
} from "./checks/standards";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export interface DomCheckResults {
  seo: SeoDomResults;
  accessibility: AccessibilityResults;
  legal: LegalDomResults;
  standards: StandardsDomResults;
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

function defaultSeo(reason: string): SeoDomResults {
  return { checks: [errorCheck("seo-dom-track", reason)] };
}

function defaultA11y(reason: string): AccessibilityResults {
  return {
    violations: [errorCheck("accessibility-track", reason)],
    incomplete: [],
    passCount: 0,
    error: reason,
  };
}

function defaultLegal(reason: string): LegalDomResults {
  return { checks: [errorCheck("legal-track", reason)] };
}

function defaultStandards(reason: string): StandardsDomResults {
  return { checks: [errorCheck("standards-track", reason)] };
}

export async function runDomChecks(url: string): Promise<DomCheckResults> {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    await page
      .goto(url, { waitUntil: "networkidle", timeout: 30_000 })
      .catch(() => {
        Sentry.logger.warn("Playwright networkidle failed, falling back to load", { url });
        return page.goto(url, { waitUntil: "load", timeout: 30_000 });
      });

    const [seoResult, a11yResult, legalResult, standardsResult] =
      await Promise.allSettled([
        extractSeoDomChecks(page),
        extractAccessibilityChecks(page),
        extractLegalDomChecks(page),
        extractStandardsDomChecks(page),
      ]);

    const failures = [
      seoResult.status === "rejected" && "seo",
      a11yResult.status === "rejected" && "accessibility",
      legalResult.status === "rejected" && "legal",
      standardsResult.status === "rejected" && "standards",
    ].filter(Boolean) as string[];

    if (failures.length > 0) {
      Sentry.logger.warn("DOM sub-checks failed", {
        url,
        failedChecks: failures.join(", "),
        seoError: seoResult.status === "rejected" ? String(seoResult.reason) : null,
        a11yError: a11yResult.status === "rejected" ? String(a11yResult.reason) : null,
        legalError: legalResult.status === "rejected" ? String(legalResult.reason) : null,
        standardsError: standardsResult.status === "rejected" ? String(standardsResult.reason) : null,
      });
    }

    return {
      seo:
        seoResult.status === "fulfilled"
          ? seoResult.value
          : defaultSeo(String(seoResult.reason)),
      accessibility:
        a11yResult.status === "fulfilled"
          ? a11yResult.value
          : defaultA11y(String(a11yResult.reason)),
      legal:
        legalResult.status === "fulfilled"
          ? legalResult.value
          : defaultLegal(String(legalResult.reason)),
      standards:
        standardsResult.status === "fulfilled"
          ? standardsResult.value
          : defaultStandards(String(standardsResult.reason)),
    };
  } finally {
    await browser.close();
  }
}
