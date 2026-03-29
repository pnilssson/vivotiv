import type { Page } from "playwright";
import type { CheckResult } from "@vivotiv/shared";

export interface StandardsDomResults {
  checks: CheckResult[];
}

export async function extractStandardsDomChecks(
  page: Page,
): Promise<StandardsDomResults> {
  const results = await Promise.allSettled([
    checkResponsiveDesign(page),
    checkDeprecatedHtml(page),
    checkFavicon(page),
    checkThirdPartyScripts(page),
  ]);

  const checks = results
    .filter(
      (r): r is PromiseFulfilledResult<CheckResult> => r.status === "fulfilled",
    )
    .map((r) => r.value);

  return { checks };
}

async function checkResponsiveDesign(page: Page): Promise<CheckResult> {
  const viewport = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    return meta?.getAttribute("content") ?? null;
  });

  if (!viewport) {
    return buildCheck(
      "responsive-design",
      "Responsive Design",
      "fail",
      "No viewport meta tag",
      3,
      "A viewport meta tag with width=device-width is essential for mobile-friendly rendering. Over 60% of web traffic is mobile.",
    );
  }

  if (!viewport.includes("width=device-width")) {
    return buildCheck(
      "responsive-design",
      "Responsive Design",
      "warn",
      "Viewport meta tag missing width=device-width",
      3,
      "A viewport meta tag with width=device-width is essential for mobile-friendly rendering. Over 60% of web traffic is mobile.",
    );
  }

  return buildCheck(
    "responsive-design",
    "Responsive Design",
    "pass",
    "Viewport configured correctly",
    3,
    "A viewport meta tag with width=device-width is essential for mobile-friendly rendering. Over 60% of web traffic is mobile.",
  );
}

const DEPRECATED_TAGS = ["font", "center", "marquee", "blink", "big", "strike"];

async function checkDeprecatedHtml(page: Page): Promise<CheckResult> {
  const found = await page.evaluate((tags: string[]) => {
    const results: string[] = [];

    for (const tag of tags) {
      const count = document.getElementsByTagName(tag).length;
      if (count > 0) {
        results.push(`<${tag}> (${count})`);
      }
    }

    // Check for layout tables (tables without role="presentation" or role="none" that contain nested tables or wide content)
    const tables = document.querySelectorAll(
      'table:not([role="presentation"]):not([role="none"]):not([role="grid"])',
    );
    let layoutTables = 0;
    for (const table of tables) {
      // Heuristic: tables with no <th> and nested tables are likely layout tables
      const hasHeaders = table.querySelector("th") !== null;
      const hasNestedTable = table.querySelector("table") !== null;
      if (!hasHeaders && hasNestedTable) layoutTables++;
    }
    if (layoutTables > 0) {
      results.push(`Layout tables (${layoutTables})`);
    }

    return results;
  }, DEPRECATED_TAGS);

  if (found.length === 0) {
    return buildCheck(
      "deprecated-html",
      "Deprecated HTML",
      "pass",
      "No deprecated elements found",
      2,
      "Deprecated HTML elements signal an outdated codebase and can cause rendering issues in modern browsers.",
    );
  }

  return buildCheck(
    "deprecated-html",
    "Deprecated HTML",
    "fail",
    `${found.length} deprecated pattern${found.length === 1 ? "" : "s"} found`,
    2,
    "Deprecated HTML elements signal an outdated codebase and can cause rendering issues in modern browsers.",
    found,
  );
}

async function checkFavicon(page: Page): Promise<CheckResult> {
  const hasLinkIcon = await page.evaluate(() => {
    const link = document.querySelector(
      'link[rel="icon"], link[rel="shortcut icon"]',
    );
    return link !== null;
  });

  if (hasLinkIcon) {
    return buildCheck(
      "favicon",
      "Favicon",
      "pass",
      "Present",
      1,
      "A favicon adds professionalism and helps users identify your site in browser tabs and bookmarks.",
    );
  }

  // Fallback: check /favicon.ico
  try {
    const origin = new URL(page.url()).origin;
    const response = await page.request.get(`${origin}/favicon.ico`);
    if (response.status() === 200) {
      return buildCheck(
        "favicon",
        "Favicon",
        "pass",
        "Present (favicon.ico)",
        1,
        "A favicon adds professionalism and helps users identify your site in browser tabs and bookmarks.",
      );
    }
  } catch {
    // Ignore fetch errors
  }

  return buildCheck(
    "favicon",
    "Favicon",
    "warn",
    "No favicon found",
    1,
    "A favicon adds professionalism and helps users identify your site in browser tabs and bookmarks.",
  );
}

async function checkThirdPartyScripts(page: Page): Promise<CheckResult> {
  const thirdParty = await page.evaluate(() => {
    const origin = window.location.origin;
    const origins = new Set<string>();

    for (const script of document.querySelectorAll("script[src]")) {
      const src = script.getAttribute("src") ?? "";
      try {
        const url = new URL(src, origin);
        if (url.origin !== origin) {
          origins.add(url.hostname);
        }
      } catch {
        // Skip invalid URLs
      }
    }

    return [...origins];
  });

  const count = thirdParty.length;

  if (count === 0) {
    return buildCheck(
      "third-party-scripts",
      "Third-Party Scripts",
      "pass",
      "No third-party scripts",
      2,
      "Excessive third-party scripts slow down page load, increase security risk, and are common on old WordPress sites with many plugins.",
    );
  }

  if (count > 20) {
    return buildCheck(
      "third-party-scripts",
      "Third-Party Scripts",
      "fail",
      `${count} third-party origins`,
      2,
      "Excessive third-party scripts slow down page load, increase security risk, and are common on old WordPress sites with many plugins.",
      thirdParty.slice(0, 10),
    );
  }

  if (count > 10) {
    return buildCheck(
      "third-party-scripts",
      "Third-Party Scripts",
      "warn",
      `${count} third-party origins`,
      2,
      "Excessive third-party scripts slow down page load, increase security risk, and are common on old WordPress sites with many plugins.",
      thirdParty.slice(0, 10),
    );
  }

  return buildCheck(
    "third-party-scripts",
    "Third-Party Scripts",
    "pass",
    `${count} third-party origin${count === 1 ? "" : "s"}`,
    2,
    "Excessive third-party scripts slow down page load, increase security risk, and are common on old WordPress sites with many plugins.",
    thirdParty,
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
