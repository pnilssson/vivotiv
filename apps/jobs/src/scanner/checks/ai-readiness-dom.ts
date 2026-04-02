import type { Page } from "playwright";
import type { CheckResult } from "@vivotiv/shared";

import { buildCheck } from "./build-check";

export interface AiReadinessDomResults {
  checks: CheckResult[];
}

export async function extractAiReadinessDomChecks(
  page: Page,
): Promise<AiReadinessDomResults> {
  const entries: Array<{ id: string; promise: Promise<CheckResult> }> = [
    { id: "ai-structured-data-completeness", promise: checkStructuredDataCompleteness(page) },
    { id: "ai-semantic-html", promise: checkSemanticHtml(page) },
    { id: "ai-entity-clarity", promise: checkEntityClarity(page) },
    { id: "ai-citation-readiness", promise: checkCitationReadiness(page) },
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

// Check 3: Structured Data Completeness (AI lens)
async function checkStructuredDataCompleteness(page: Page): Promise<CheckResult> {
  const data = await page.evaluate(() => {
    const blocks: unknown[] = [];
    for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        blocks.push(JSON.parse(el.textContent ?? ""));
      } catch {
        // skip invalid JSON-LD
      }
    }

    // Flatten @graph arrays
    const entities: Record<string, unknown>[] = [];
    for (const block of blocks) {
      const b = block as Record<string, unknown>;
      if (Array.isArray(b?.["@graph"])) {
        for (const item of b["@graph"]) {
          entities.push(item as Record<string, unknown>);
        }
      } else if (b?.["@type"]) {
        entities.push(b);
      }
    }

    const orgTypes = ["Organization", "LocalBusiness", "Corporation", "Store",
      "Restaurant", "ProfessionalService", "MedicalBusiness", "LegalService",
      "FinancialService", "RealEstateAgent", "AutoDealer", "HomeAndConstructionBusiness"];

    const org = entities.find((e) => {
      const type = e["@type"];
      if (typeof type === "string") return orgTypes.includes(type);
      if (Array.isArray(type)) return type.some((t) => orgTypes.includes(String(t)));
      return false;
    });

    const hasName = !!org?.name;
    const hasUrl = !!org?.url;
    const hasDescription = !!org?.description;
    const hasLogo = !!org?.logo;
    const hasSameAs = Array.isArray(org?.sameAs) && (org.sameAs as unknown[]).length > 0;
    const hasId = entities.some((e) => !!e["@id"]);
    const hasGraph = blocks.some((b) => Array.isArray((b as Record<string, unknown>)?.["@graph"]));

    // Check for FAQ schema
    const hasFaq = entities.some((e) => {
      const type = e["@type"];
      return type === "FAQPage" || (Array.isArray(type) && type.includes("FAQPage"));
    });

    return {
      hasOrg: !!org,
      hasName,
      hasUrl,
      hasDescription,
      hasLogo,
      hasSameAs,
      hasId,
      hasGraph,
      hasFaq,
      entityCount: entities.length,
    };
  });

  if (!data.hasOrg) {
    return buildCheck(
      "ai-structured-data-completeness",
      "Structured Data for AI",
      "fail",
      "No Organization or LocalBusiness schema found",
      2,
      "AI search engines use structured data to identify what your business is, where it operates, and what it offers. Without it, AI cannot confidently represent your business.",
    );
  }

  const missing: string[] = [];
  if (!data.hasName) missing.push("name");
  if (!data.hasUrl) missing.push("url");
  if (!data.hasDescription) missing.push("description");
  if (!data.hasLogo) missing.push("logo");
  if (!data.hasSameAs) missing.push("sameAs (social/directory links)");
  if (!data.hasId) missing.push("@id cross-references");

  const bonuses: string[] = [];
  if (data.hasGraph) bonuses.push("@graph structure connecting entities");
  if (data.hasFaq) bonuses.push("FAQPage schema present");

  if (missing.length === 0) {
    const extras = bonuses.length > 0 ? ` + ${bonuses.join(", ")}` : "";
    return buildCheck(
      "ai-structured-data-completeness",
      "Structured Data for AI",
      "pass",
      `Complete Organization schema with ${data.entityCount} connected entities${extras}`,
      2,
      "Your structured data gives AI search engines a clear picture of your business identity, making it easier for them to reference you accurately.",
      bonuses.length > 0 ? bonuses : null,
    );
  }

  if (missing.length <= 2 && data.hasName && data.hasDescription) {
    return buildCheck(
      "ai-structured-data-completeness",
      "Structured Data for AI",
      "warn",
      `Organization schema present but missing ${missing.join(", ")}`,
      2,
      "Your structured data identifies your business but is missing fields that help AI systems build a more complete picture. Adding these makes it easier for AI to reference you.",
      [...missing, ...bonuses],
    );
  }

  return buildCheck(
    "ai-structured-data-completeness",
    "Structured Data for AI",
    "warn",
    `Organization schema incomplete: missing ${missing.join(", ")}`,
    2,
    "AI search engines use structured data to identify what your business is, where it operates, and what it offers. Incomplete schema reduces your visibility in AI-generated answers.",
    [...missing, ...bonuses],
  );
}

// Check 5: Semantic HTML
async function checkSemanticHtml(page: Page): Promise<CheckResult> {
  const data = await page.evaluate(() => {
    const mainCount = document.querySelectorAll("main").length;
    const articleCount = document.querySelectorAll("article").length;
    const sectionCount = document.querySelectorAll("section").length;
    const navCount = document.querySelectorAll("nav").length;
    const headerCount = document.querySelectorAll("header").length;
    const footerCount = document.querySelectorAll("footer").length;
    const divCount = document.querySelectorAll("div").length;

    return { mainCount, articleCount, sectionCount, navCount, headerCount, footerCount, divCount };
  });

  const semanticElements: string[] = [];
  if (data.mainCount > 0) semanticElements.push(`<main> (${data.mainCount})`);
  if (data.articleCount > 0) semanticElements.push(`<article> (${data.articleCount})`);
  if (data.sectionCount > 0) semanticElements.push(`<section> (${data.sectionCount})`);
  if (data.navCount > 0) semanticElements.push(`<nav> (${data.navCount})`);
  if (data.headerCount > 0) semanticElements.push(`<header> (${data.headerCount})`);
  if (data.footerCount > 0) semanticElements.push(`<footer> (${data.footerCount})`);

  const hasMain = data.mainCount > 0;
  const otherSemanticCount = [data.articleCount, data.sectionCount, data.navCount, data.headerCount, data.footerCount]
    .filter((c) => c > 0).length;

  if (hasMain && otherSemanticCount >= 2) {
    return buildCheck(
      "ai-semantic-html",
      "Semantic HTML",
      "pass",
      `${semanticElements.length} semantic element types used`,
      1,
      "Semantic HTML tags like <main>, <article>, and <nav> help AI crawlers distinguish your primary content from navigation and sidebars.",
      semanticElements,
    );
  }

  if (semanticElements.length > 0) {
    const issues: string[] = [];
    if (!hasMain) issues.push("Missing <main> element");
    if (otherSemanticCount < 2) issues.push("Limited use of semantic elements");

    return buildCheck(
      "ai-semantic-html",
      "Semantic HTML",
      "warn",
      `${semanticElements.length} semantic element type${semanticElements.length === 1 ? "" : "s"}, ${data.divCount} divs`,
      1,
      "Your page uses some semantic HTML but is missing key elements. Without <main>, AI crawlers must parse the entire page to find your actual content.",
      [...issues, ...semanticElements],
    );
  }

  return buildCheck(
    "ai-semantic-html",
    "Semantic HTML",
    "fail",
    `No semantic elements found (${data.divCount} divs)`,
    1,
    "Your page uses no semantic HTML tags. AI crawlers see hundreds of nested <div> elements and cannot distinguish your main content from navigation, sidebars, and page chrome.",
  );
}

// Check 6: Entity Clarity
async function checkEntityClarity(page: Page): Promise<CheckResult> {
  const data = await page.evaluate(() => {
    const title = document.title?.trim() ?? "";

    const metaDesc = document.querySelector('meta[name="description"]')
      ?.getAttribute("content")?.trim() ?? "";

    const ogTitle = document.querySelector('meta[property="og:title"]')
      ?.getAttribute("content")?.trim() ?? "";

    const ogDesc = document.querySelector('meta[property="og:description"]')
      ?.getAttribute("content")?.trim() ?? "";

    const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";

    // Get Organization/LocalBusiness name from JSON-LD
    let schemaName = "";
    let schemaDesc = "";
    const orgTypes = ["Organization", "LocalBusiness", "Corporation", "Store",
      "Restaurant", "ProfessionalService", "MedicalBusiness"];

    for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const parsed = JSON.parse(el.textContent ?? "") as Record<string, unknown>;
        const entities = Array.isArray(parsed["@graph"])
          ? (parsed["@graph"] as Record<string, unknown>[])
          : [parsed];

        for (const entity of entities) {
          const type = entity["@type"];
          const isOrg = typeof type === "string"
            ? orgTypes.includes(type)
            : Array.isArray(type) && type.some((t) => orgTypes.includes(String(t)));

          if (isOrg) {
            schemaName = String(entity.name ?? "").trim();
            schemaDesc = String(entity.description ?? "").trim();
            break;
          }
        }
      } catch {
        // skip
      }
      if (schemaName) break;
    }

    return { title, metaDesc, ogTitle, ogDesc, h1, schemaName, schemaDesc };
  });

  const issues: string[] = [];

  // Check presence
  if (!data.title) issues.push("Missing <title>");
  if (!data.metaDesc) issues.push("Missing meta description");
  if (!data.h1) issues.push("Missing <h1>");

  // Check consistency between sources
  const nameSources = [data.title, data.ogTitle, data.schemaName, data.h1].filter(Boolean);

  if (nameSources.length >= 2) {
    // Check if there's a common substring (business name) across sources
    const shortest = nameSources.reduce((a, b) => a.length < b.length ? a : b);
    const namePresent = nameSources.filter((s) =>
      s.toLowerCase().includes(shortest.toLowerCase()) ||
      shortest.toLowerCase().includes(s.toLowerCase())
    );

    if (namePresent.length < nameSources.length * 0.5) {
      issues.push("Business name inconsistent across title, OG, schema, and H1");
    }
  }

  // Check descriptions
  const hasAnyDesc = data.metaDesc || data.ogDesc || data.schemaDesc;
  if (!hasAnyDesc) {
    issues.push("No description found in meta, OG, or schema");
  }

  if (data.metaDesc && data.metaDesc.length < 30) {
    issues.push("Meta description too short to identify the business");
  }

  // Scoring
  const hasIdentifiableName = data.title && (data.schemaName || data.h1);
  const hasConsistentPresence = issues.length === 0;

  if (hasConsistentPresence && hasIdentifiableName && hasAnyDesc) {
    return buildCheck(
      "ai-entity-clarity",
      "Entity Clarity",
      "pass",
      "Business identity consistent across title, schema, and meta",
      1,
      "AI systems can confidently identify your business because your name and description are consistent across page signals.",
    );
  }

  if (hasIdentifiableName && issues.length <= 2) {
    return buildCheck(
      "ai-entity-clarity",
      "Entity Clarity",
      "warn",
      `Business identifiable but ${issues.length} consistency issue${issues.length === 1 ? "" : "s"}`,
      1,
      "AI systems can identify your business but inconsistencies across your page signals reduce confidence. Aligning title, meta, schema, and OG data strengthens your entity profile.",
      issues,
    );
  }

  return buildCheck(
    "ai-entity-clarity",
    "Entity Clarity",
    "fail",
    "Cannot consistently identify the business from page signals",
    1,
    "AI systems cross-reference your title, meta description, structured data, and headings to identify your business. Contradictory or missing information means AI cannot confidently represent you.",
    issues,
  );
}

// Check 7: Citation Readiness
async function checkCitationReadiness(page: Page): Promise<CheckResult> {
  const data = await page.evaluate(() => {
    const main =
      document.querySelector("main") ??
      document.querySelector("article") ??
      document.querySelector('[role="main"]') ??
      document.body;

    // Data tables (not layout tables)
    const tables = main.querySelectorAll("table");
    let dataTables = 0;
    for (const table of tables) {
      const hasHeaders = table.querySelector("th") !== null;
      if (hasHeaders) dataTables++;
    }

    // Content lists (not in nav)
    const lists = main.querySelectorAll("ul, ol");
    let contentLists = 0;
    for (const list of lists) {
      const inNav = list.closest("nav") !== null;
      const inHeader = list.closest("header") !== null;
      const inFooter = list.closest("footer") !== null;
      if (!inNav && !inHeader && !inFooter) {
        const items = list.querySelectorAll("li");
        if (items.length >= 3) contentLists++;
      }
    }

    // Statistics/numbers in content
    const clone = main.cloneNode(true) as HTMLElement;
    for (const el of clone.querySelectorAll("nav, header, footer, script, style, noscript")) {
      el.remove();
    }
    const text = clone.textContent ?? "";
    const statsPattern = /\d+[\s,.]*\d*\s*(%|procent|percent|kr|SEK|EUR|USD|\$|€)/gi;
    const statsCount = (text.match(statsPattern) ?? []).length;

    // FAQ-like patterns (heading followed by short answer)
    const headings = main.querySelectorAll("h2, h3, h4");
    let faqPatterns = 0;
    for (const heading of headings) {
      const headingText = heading.textContent?.trim() ?? "";
      if (headingText.endsWith("?")) faqPatterns++;
    }

    // Self-contained sections: heading followed by 80-250 words
    let selfContainedSections = 0;
    for (const heading of headings) {
      let wordCount = 0;
      let sibling = heading.nextElementSibling;
      while (sibling && !["H1", "H2", "H3", "H4", "H5", "H6"].includes(sibling.tagName)) {
        const sText = sibling.textContent?.trim() ?? "";
        wordCount += sText.split(/\s+/).filter((w) => w.length > 0).length;
        sibling = sibling.nextElementSibling;
      }
      if (wordCount >= 80 && wordCount <= 250) selfContainedSections++;
    }

    return { dataTables, contentLists, statsCount, faqPatterns, selfContainedSections };
  });

  const patterns: string[] = [];
  if (data.dataTables > 0) patterns.push(`${data.dataTables} data table${data.dataTables === 1 ? "" : "s"}`);
  if (data.contentLists > 0) patterns.push(`${data.contentLists} content list${data.contentLists === 1 ? "" : "s"}`);
  if (data.statsCount > 0) patterns.push(`${data.statsCount} statistic${data.statsCount === 1 ? "" : "s"}/figure${data.statsCount === 1 ? "" : "s"}`);
  if (data.faqPatterns > 0) patterns.push(`${data.faqPatterns} FAQ-style heading${data.faqPatterns === 1 ? "" : "s"}`);
  if (data.selfContainedSections > 0) patterns.push(`${data.selfContainedSections} citable section${data.selfContainedSections === 1 ? "" : "s"}`);

  if (patterns.length >= 3) {
    return buildCheck(
      "ai-citation-readiness",
      "Citation Readiness",
      "pass",
      `${patterns.length} citation-friendly patterns found`,
      1,
      "Your content includes structures that AI systems prefer to cite: tables, lists, statistics, and self-contained answer sections.",
      patterns,
    );
  }

  if (patterns.length >= 1) {
    return buildCheck(
      "ai-citation-readiness",
      "Citation Readiness",
      "warn",
      `${patterns.length} citation-friendly pattern${patterns.length === 1 ? "" : "s"} found`,
      1,
      "Your content has some citation-friendly structures, but adding more (data tables, lists, statistics, FAQ sections) increases the chance AI search engines quote your content.",
      patterns,
    );
  }

  return buildCheck(
    "ai-citation-readiness",
    "Citation Readiness",
    "fail",
    "No citation-friendly content patterns found",
    1,
    "AI search engines are more likely to cite pages with data tables (4.1x more citations), statistics (30-40% higher visibility), and answer-first content. Your page lacks these structural patterns.",
  );
}
