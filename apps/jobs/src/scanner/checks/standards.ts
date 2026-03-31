import type { Page } from "playwright";
import type { CheckResult } from "@vivotiv/shared";

import { buildCheck } from "./build-check";

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
    { id: "heading-structure", promise: checkHeadingStructure(page) },
    { id: "content-basics", promise: checkContentBasics(page) },
    { id: "url-structure", promise: checkUrlStructure(page) },
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

async function checkHeadingStructure(page: Page): Promise<CheckResult> {
  const headings = await page.evaluate(() => {
    const elements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    return Array.from(elements).map((el) => ({
      tag: el.tagName.toLowerCase(),
      level: Number(el.tagName[1]),
      text: (el.textContent ?? "").trim(),
    }));
  });

  const issues: string[] = [];
  const h1Count = headings.filter((h) => h.tag === "h1").length;

  if (h1Count === 0) {
    issues.push("No H1 heading found");
  } else if (h1Count > 1) {
    issues.push(`${h1Count} H1 headings found (should be exactly 1)`);
  }

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    if (curr > prev + 1) {
      issues.push(`Skipped heading level: <${headings[i - 1].tag}> followed by <${headings[i].tag}>`);
    }
  }

  const emptyCount = headings.filter((h) => h.text === "").length;
  if (emptyCount > 0) {
    issues.push(`${emptyCount} empty heading${emptyCount === 1 ? "" : "s"}`);
  }

  if (h1Count === 0 || h1Count > 1) {
    return buildCheck(
      "heading-structure",
      "Heading Structure",
      "fail",
      `${issues.length} heading issue${issues.length === 1 ? "" : "s"} found`,
      1,
      "A clear heading hierarchy helps search engines and screen readers understand your page structure. Every page should have exactly one H1.",
      issues,
    );
  }

  if (issues.length > 0) {
    return buildCheck(
      "heading-structure",
      "Heading Structure",
      "warn",
      `${issues.length} heading issue${issues.length === 1 ? "" : "s"} found`,
      1,
      "A clear heading hierarchy helps search engines and screen readers understand your page structure. Every page should have exactly one H1.",
      issues,
    );
  }

  return buildCheck(
    "heading-structure",
    "Heading Structure",
    "pass",
    "Heading structure is correct",
    1,
    "A clear heading hierarchy helps search engines and screen readers understand your page structure. Every page should have exactly one H1.",
  );
}

async function checkContentBasics(page: Page): Promise<CheckResult> {
  const result = await page.evaluate(() => {
    const lang = document.documentElement.lang?.trim() ?? "";

    const main =
      document.querySelector("main") ??
      document.querySelector("article") ??
      document.querySelector('[role="main"]') ??
      document.body;

    const clone = main.cloneNode(true) as HTMLElement;
    for (const el of clone.querySelectorAll(
      "nav, header, footer, script, style, noscript, svg",
    )) {
      el.remove();
    }

    const text = (clone.textContent ?? "").trim();
    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

    return { lang, wordCount };
  });

  const issues: string[] = [];

  if (!result.lang) {
    issues.push("Missing lang attribute on <html> element");
  }

  if (result.wordCount < 50) {
    issues.push(`Only ${result.wordCount} words of content`);
  } else if (result.wordCount < 200) {
    issues.push(`${result.wordCount} words of content (thin page)`);
  }

  if (result.wordCount < 50) {
    return buildCheck(
      "content-basics",
      "Content Quality",
      "fail",
      `${result.wordCount} words${!result.lang ? ", no lang attribute" : ""}`,
      1,
      "Pages with very little content appear abandoned or incomplete. A missing lang attribute hurts SEO and accessibility for non-English sites.",
      issues,
    );
  }

  if (issues.length > 0) {
    return buildCheck(
      "content-basics",
      "Content Quality",
      "warn",
      `${result.wordCount} words${!result.lang ? ", no lang attribute" : ""}`,
      1,
      "Pages with very little content appear abandoned or incomplete. A missing lang attribute hurts SEO and accessibility for non-English sites.",
      issues,
    );
  }

  return buildCheck(
    "content-basics",
    "Content Quality",
    "pass",
    `${result.wordCount} words, lang="${result.lang}"`,
    1,
    "Pages with very little content appear abandoned or incomplete. A missing lang attribute hurts SEO and accessibility for non-English sites.",
  );
}

async function checkUrlStructure(page: Page): Promise<CheckResult> {
  const url = new URL(page.url());
  const issues: string[] = [];

  if (url.pathname !== url.pathname.toLowerCase()) {
    issues.push("URL path contains uppercase characters");
  }

  if (url.pathname.includes("_")) {
    issues.push("URL path uses underscores instead of hyphens");
  }

  if (/\/\//.test(url.pathname.slice(1))) {
    issues.push("URL path contains double slashes");
  }

  if (url.pathname.length > 200) {
    issues.push(`URL path is ${url.pathname.length} characters (over 200)`);
  }

  const paramCount = Array.from(url.searchParams).length;
  if (paramCount > 3) {
    issues.push(`URL has ${paramCount} query parameters`);
  }

  if (issues.length > 0) {
    return buildCheck(
      "url-structure",
      "URL Structure",
      "warn",
      `${issues.length} URL issue${issues.length === 1 ? "" : "s"} found`,
      1,
      "Clean URLs improve SEO and user trust. Avoid uppercase, underscores, excessive parameters, and overly long paths.",
      issues,
    );
  }

  return buildCheck(
    "url-structure",
    "URL Structure",
    "pass",
    "URL structure is clean",
    1,
    "Clean URLs improve SEO and user trust. Avoid uppercase, underscores, excessive parameters, and overly long paths.",
  );
}

