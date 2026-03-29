import { chromium } from "playwright";

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

export interface DomCheckResults {
  seo: SeoDomResults;
  accessibility: AccessibilityResults;
  legal: LegalDomResults;
  standards: StandardsDomResults;
}

export async function runDomChecks(url: string): Promise<DomCheckResults> {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load", timeout: 30_000 });

    const [seo, accessibility, legal, standards] = await Promise.all([
      extractSeoDomChecks(page),
      extractAccessibilityChecks(page),
      extractLegalDomChecks(page),
      extractStandardsDomChecks(page),
    ]);

    return { seo, accessibility, legal, standards };
  } finally {
    await browser.close();
  }
}
