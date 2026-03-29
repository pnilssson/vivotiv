import type { Page } from "playwright";
import type { CheckResult } from "@vivotiv/shared";

export interface SeoDomResults {
  checks: CheckResult[];
}

export async function extractSeoDomChecks(page: Page): Promise<SeoDomResults> {
  const entries: Array<{ id: string; promise: Promise<CheckResult> }> = [
    { id: "robots-txt", promise: checkRobotsTxt(page) },
    { id: "sitemap-xml", promise: checkSitemapXml(page) },
    { id: "structured-data", promise: checkStructuredData(page) },
    { id: "open-graph", promise: checkOpenGraph(page) },
    { id: "twitter-cards", promise: checkTwitterCards(page) },
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
  const data = await page.evaluate(() => {
    // JSON-LD
    const jsonLd: unknown[] = [];
    for (const el of document.querySelectorAll(
      'script[type="application/ld+json"]',
    )) {
      try {
        jsonLd.push(JSON.parse(el.textContent ?? ""));
      } catch {
        // skip invalid JSON-LD
      }
    }

    // Microdata (itemscope/itemprop)
    const microdataCount = document.querySelectorAll("[itemscope]").length;
    const microdataTypes = [
      ...new Set(
        [...document.querySelectorAll("[itemscope][itemtype]")].map(
          (el) => el.getAttribute("itemtype")?.replace(/^https?:\/\/schema\.org\//, "") ?? "",
        ).filter(Boolean),
      ),
    ];

    // RDFa
    const rdfaCount = document.querySelectorAll("[typeof]").length;

    return { jsonLd, microdataCount, microdataTypes, rdfaCount };
  });

  const jsonLdValid = data.jsonLd.filter(Boolean);
  const jsonLdTypes = jsonLdValid
    .map((obj) => (obj as Record<string, unknown>)?.["@type"])
    .filter(Boolean)
    .flat()
    .map(String);

  const formats: string[] = [];
  if (jsonLdValid.length > 0) formats.push(`${jsonLdValid.length} JSON-LD`);
  if (data.microdataCount > 0) formats.push(`${data.microdataCount} Microdata`);
  if (data.rdfaCount > 0) formats.push(`${data.rdfaCount} RDFa`);

  if (formats.length === 0) {
    return buildCheck(
      "structured-data",
      "Structured Data",
      "warn",
      "No structured data found",
      1,
      "Adding structured data (schema.org) helps search engines understand your content and can enable rich snippets in search results.",
    );
  }

  const allTypes = [...jsonLdTypes, ...data.microdataTypes];

  return buildCheck(
    "structured-data",
    "Structured Data",
    "pass",
    `${formats.join(", ")}${allTypes.length > 0 ? `: ${allTypes.join(", ")}` : ""}`,
    1,
    "Structured data helps search engines understand your content and can enable rich snippets in search results.",
    allTypes.length > 0 ? allTypes : null,
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

  const required = ["og:title", "og:description", "og:image", "og:type", "og:url"];
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

async function checkTwitterCards(page: Page): Promise<CheckResult> {
  const twitterTags = await page.evaluate(() => {
    const tags: Record<string, string> = {};
    for (const el of document.querySelectorAll('meta[name^="twitter:"]')) {
      const name = el.getAttribute("name");
      const content = el.getAttribute("content");
      if (name && content) tags[name] = content;
    }
    return tags;
  });

  const required = [
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
  ];
  const missing = required.filter((tag) => !twitterTags[tag]);

  if (missing.length === required.length) {
    return buildCheck(
      "twitter-cards",
      "Twitter Cards",
      "warn",
      "No Twitter Card tags found",
      1,
      "Twitter Card tags improve previews when links are shared on X and many chat/social tools.",
      missing,
    );
  }

  if (missing.length > 0) {
    return buildCheck(
      "twitter-cards",
      "Twitter Cards",
      "warn",
      `Missing: ${missing.map((t) => t.replace("twitter:", "")).join(", ")}`,
      1,
      "Twitter Card tags improve previews when links are shared on X and many chat/social tools.",
      missing,
    );
  }

  return buildCheck(
    "twitter-cards",
    "Twitter Cards",
    "pass",
    "All recommended tags present",
    1,
    "Twitter Card tags improve previews when links are shared on X and many chat/social tools.",
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
