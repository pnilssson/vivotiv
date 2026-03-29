import type { Page } from "playwright";
import type { CheckResult } from "@vivotiv/shared";

export interface SeoDomResults {
  checks: CheckResult[];
}

export async function extractSeoDomChecks(page: Page): Promise<SeoDomResults> {
  const results = await Promise.allSettled([
    checkRobotsTxt(page),
    checkSitemapXml(page),
    checkStructuredData(page),
    checkOpenGraph(page),
  ]);

  const checks = results
    .filter(
      (r): r is PromiseFulfilledResult<CheckResult> => r.status === "fulfilled",
    )
    .map((r) => r.value);

  return { checks };
}

async function checkRobotsTxt(page: Page): Promise<CheckResult> {
  const origin = new URL(page.url()).origin;

  try {
    const response = await page.request.get(`${origin}/robots.txt`);
    const status = response.status();
    const body = await response.text();

    if (status !== 200 || !body.trim()) {
      return buildCheck("robots-txt", "robots.txt", "fail", "Missing", 1);
    }

    const blocksAll = /^disallow:\s*\/\s*$/m.test(body.toLowerCase());

    if (blocksAll) {
      return buildCheck(
        "robots-txt",
        "robots.txt",
        "warn",
        "Present but blocks all crawling",
        1,
      );
    }

    return buildCheck("robots-txt", "robots.txt", "pass", "Valid", 1);
  } catch {
    return buildCheck("robots-txt", "robots.txt", "fail", "Not reachable", 1);
  }
}

async function checkSitemapXml(page: Page): Promise<CheckResult> {
  const origin = new URL(page.url()).origin;

  try {
    const response = await page.request.get(`${origin}/sitemap.xml`);
    const status = response.status();
    const body = await response.text();

    if (status !== 200) {
      return buildCheck(
        "sitemap-xml",
        "Sitemap",
        "fail",
        "Missing",
        1,
      );
    }

    if (!body.includes("<urlset") && !body.includes("<sitemapindex")) {
      return buildCheck(
        "sitemap-xml",
        "Sitemap",
        "warn",
        "Present but not valid XML sitemap",
        1,
      );
    }

    return buildCheck("sitemap-xml", "Sitemap", "pass", "Valid", 1);
  } catch {
    return buildCheck(
      "sitemap-xml",
      "Sitemap",
      "fail",
      "Not reachable",
      1,
    );
  }
}

async function checkStructuredData(page: Page): Promise<CheckResult> {
  const jsonLdScripts = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) =>
      els.map((el) => {
        try {
          return JSON.parse(el.textContent ?? "");
        } catch {
          return null;
        }
      }),
    );

  const valid = jsonLdScripts.filter(Boolean);

  if (valid.length === 0) {
    return buildCheck(
      "structured-data",
      "Structured Data",
      "warn",
      "No JSON-LD found",
      1,
      "Adding structured data (schema.org) helps search engines understand your content and can enable rich snippets in search results.",
    );
  }

  const types = valid
    .map((obj) => obj?.["@type"])
    .filter(Boolean)
    .flat();

  return buildCheck(
    "structured-data",
    "Structured Data",
    "pass",
    `${valid.length} schema(s) found: ${types.join(", ") || "unknown type"}`,
    1,
    "Structured data helps search engines understand your content and can enable rich snippets in search results.",
    types.length > 0 ? types.map(String) : null,
  );
}

async function checkOpenGraph(page: Page): Promise<CheckResult> {
  const ogTags = await page.evaluate(() => {
    const tags: Record<string, string> = {};
    for (const el of document.querySelectorAll('meta[property^="og:"]')) {
      const prop = el.getAttribute("property");
      const content = el.getAttribute("content");
      if (prop && content) tags[prop] = content;
    }
    return tags;
  });

  const required = ["og:title", "og:description", "og:image"];
  const missing = required.filter((tag) => !ogTags[tag]);

  if (missing.length === required.length) {
    return buildCheck(
      "open-graph",
      "Open Graph Tags",
      "fail",
      "No Open Graph tags found",
      1,
      "Open Graph tags control how your page appears when shared on social media.",
      missing,
    );
  }

  if (missing.length > 0) {
    return buildCheck(
      "open-graph",
      "Open Graph Tags",
      "warn",
      `Missing: ${missing.map((t) => t.replace("og:", "")).join(", ")}`,
      1,
      "Open Graph tags control how your page appears when shared on social media.",
      missing,
    );
  }

  return buildCheck(
    "open-graph",
    "Open Graph Tags",
    "pass",
    "All required tags present",
    1,
    "Open Graph tags control how your page appears when shared on social media.",
  );
}

function buildCheck(
  id: string,
  name: string,
  status: "pass" | "warn" | "fail",
  value: string,
  weight: 1 | 2 | 3,
  description = "",
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
