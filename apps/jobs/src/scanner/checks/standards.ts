import type { Page } from "playwright";
import type { CheckResult } from "@vivotiv/shared";

export interface StandardsDomResults {
  checks: CheckResult[];
}

export async function extractStandardsDomChecks(
  page: Page,
): Promise<StandardsDomResults> {
  const entries: Array<{ id: string; promise: Promise<CheckResult> }> = [
    { id: "responsive-design", promise: checkResponsiveDesign(page) },
    { id: "deprecated-html", promise: checkDeprecatedHtml(page) },
    { id: "favicon", promise: checkFavicon(page) },
    { id: "third-party-scripts", promise: checkThirdPartyScripts(page) },
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

const DEPRECATED_TAGS = [
  "font",
  "center",
  "marquee",
  "blink",
  "big",
  "strike",
  "frame",
  "frameset",
  "applet",
  "basefont",
];

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
    const trackingPixels = new Set<string>();

    const addOrigin = (rawUrl: string) => {
      try {
        const url = new URL(rawUrl, origin);
        if (url.origin !== origin) {
          origins.add(url.hostname);
        }
      } catch {
        // Skip invalid URLs
      }
    };

    for (const script of document.querySelectorAll("script[src]")) {
      const src = script.getAttribute("src") ?? "";
      addOrigin(src);
    }

    for (const stylesheet of document.querySelectorAll('link[rel~="stylesheet"][href]')) {
      const href = stylesheet.getAttribute("href") ?? "";
      addOrigin(href);
    }

    for (const frame of document.querySelectorAll("iframe[src]")) {
      const src = frame.getAttribute("src") ?? "";
      addOrigin(src);
    }

    for (const img of document.querySelectorAll("img[src]")) {
      const image = img as HTMLImageElement;
      const src = img.getAttribute("src") ?? "";
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const looksLikePixel =
        (width > 0 && width <= 2 && height > 0 && height <= 2) ||
        /pixel|track|analytics|collect|beacon/i.test(src);

      if (looksLikePixel) {
        addOrigin(src);
        trackingPixels.add(src);
      }
    }

    return {
      origins: [...origins],
      trackingPixels: [...trackingPixels],
    };
  });

  const count = thirdParty.origins.length;

  if (count === 0) {
    return buildCheck(
      "third-party-scripts",
      "Third-Party Scripts",
      "pass",
      "No third-party resources",
      2,
      "Excessive third-party resources slow down page load, increase security risk, and are common on old WordPress sites with many plugins.",
    );
  }

  if (count > 20) {
    return buildCheck(
      "third-party-scripts",
      "Third-Party Scripts",
      "fail",
      `${count} third-party origins across scripts, CSS, iframes and tracking pixels`,
      2,
      "Excessive third-party resources slow down page load, increase security risk, and are common on old WordPress sites with many plugins.",
      [...thirdParty.origins, ...thirdParty.trackingPixels].slice(0, 10),
    );
  }

  if (count > 10) {
    return buildCheck(
      "third-party-scripts",
      "Third-Party Scripts",
      "warn",
      `${count} third-party origins across scripts, CSS, iframes and tracking pixels`,
      2,
      "Excessive third-party resources slow down page load, increase security risk, and are common on old WordPress sites with many plugins.",
      [...thirdParty.origins, ...thirdParty.trackingPixels].slice(0, 10),
    );
  }

  return buildCheck(
    "third-party-scripts",
    "Third-Party Scripts",
      "pass",
      `${count} third-party origin${count === 1 ? "" : "s"}`,
      2,
      "Excessive third-party resources slow down page load, increase security risk, and are common on old WordPress sites with many plugins.",
      [...thirdParty.origins, ...thirdParty.trackingPixels],
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
