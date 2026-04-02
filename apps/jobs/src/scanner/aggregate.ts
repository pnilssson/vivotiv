import type {
  CategoryResult,
  CheckResult,
  ScanDetailsV1,
} from "@vivotiv/shared";

import {
  buildCheck,
  extractLegalHeaderChecks,
  extractPerformanceChecks,
  extractSecurityChecks,
  extractSecurityHeaderChecks,
  extractSeoChecks,
} from "./checks";
import type { AiReadinessHttpResults } from "./ai-readiness-checks";
import type { ApiCheckResults } from "./api-checks";
import type { DomCheckResults } from "./dom-checks";
import type { HeaderCheckResults } from "./header-checks";
import type { LighthouseResult } from "./lighthouse";
import type { LinkCheckResults } from "./link-checks";
import {
  buildAccessibilityResult,
  buildCategoryResult,
  buildErrorCategory,
  calculateOverallScore,
} from "./scoring";

interface RawResults {
  lighthouse: LighthouseResult | null;
  dom: DomCheckResults | null;
  headers: HeaderCheckResults | null;
  api: ApiCheckResults | null;
  links: LinkCheckResults | null;
  aiReadinessHttp: AiReadinessHttpResults | null;
  trackErrors?: {
    lighthouse?: string | null;
    dom?: string | null;
    headers?: string | null;
    aiReadinessHttp?: string | null;
  };
}

function buildTrackErrorCheck(id: string, name: string, reason: string): CheckResult {
  return {
    id,
    name,
    status: "error",
    score: null,
    value: reason,
    rawValue: null,
    rawUnit: null,
    scoreThresholds: null,
    weight: 1,
    description: "Related scan track failed and this category may be incomplete",
    items: null,
  };
}

function splitErrorChecks(checks: CheckResult[]) {
  return {
    scored: checks.filter((check) => check.status !== "error"),
    errors: checks.filter((check) => check.status === "error"),
  };
}

export function aggregate(url: string, raw: RawResults) {
  const lighthouseError = raw.trackErrors?.lighthouse ?? null;
  const domError = raw.trackErrors?.dom ?? null;
  const headersError = raw.trackErrors?.headers ?? null;

  // Performance: Lighthouse only
  let performance: CategoryResult | null = null;
  if (raw.lighthouse) {
    const perfExtraction = extractPerformanceChecks(raw.lighthouse);
    performance = buildCategoryResult({
      metrics: perfExtraction.metrics,
      opportunities: perfExtraction.opportunities,
      diagnostics: perfExtraction.diagnostics,
    });
  } else if (lighthouseError) {
    performance = buildErrorCategory(
      "performance-track-error",
      "Performance scan failed",
      lighthouseError,
    );
  }

  if (performance && lighthouseError) {
    performance.diagnostics.push(
      buildTrackErrorCheck(
        "performance-track-error",
        "Performance scan failed",
        lighthouseError,
      ),
    );
  }

  // SEO: Lighthouse + DOM extras
  let seo: CategoryResult | null = null;
  {
    const seoMetrics: CheckResult[] = [];
    const seoOpportunities: CheckResult[] = [];
    const seoDiagnostics: CheckResult[] = [];

    if (raw.lighthouse) {
      const seoExtraction = extractSeoChecks(raw.lighthouse);
      seoMetrics.push(...seoExtraction.metrics);
      seoOpportunities.push(...seoExtraction.opportunities);
      seoDiagnostics.push(...seoExtraction.diagnostics);
    }

    if (raw.dom) {
      seoMetrics.push(...raw.dom.seo.checks);
    }

    const seoSplit = splitErrorChecks(seoMetrics);

    if (seoSplit.scored.length > 0) {
      seo = buildCategoryResult({
        metrics: seoSplit.scored,
        opportunities: seoOpportunities,
        diagnostics: [...seoDiagnostics, ...seoSplit.errors],
      });
    } else if (seoSplit.errors.length > 0) {
      seo = buildErrorCategory(
        "seo-track-error",
        "SEO scan failed",
        seoSplit.errors.map((check) => check.value).filter(Boolean).join("; "),
      );
    } else if (lighthouseError || domError) {
      seo = buildErrorCategory(
        "seo-track-error",
        "SEO scan failed",
        [lighthouseError, domError].filter(Boolean).join("; "),
      );
    }
  }

  if (seo && lighthouseError) {
    seo.diagnostics.push(
      buildTrackErrorCheck("seo-lighthouse-error", "SEO lighthouse failed", lighthouseError),
    );
  }
  if (seo && domError) {
    seo.diagnostics.push(
      buildTrackErrorCheck("seo-dom-error", "SEO DOM checks failed", domError),
    );
  }

  // Accessibility: axe-core deduction model
  const accessibility = raw.dom
    ? buildAccessibilityResult(raw.dom.accessibility)
    : domError
      ? buildErrorCategory("accessibility-track-error", "Accessibility scan failed", domError)
      : null;

  // Trust & Security: DOM legal checks + SSL headers + Lighthouse best-practices + security headers + API checks
  let trustSecurity: CategoryResult | null = null;
  {
    const tsMetrics: CheckResult[] = [];
    const tsOpportunities: CheckResult[] = [];
    const tsDiagnostics: CheckResult[] = [];

    // Trust checks (from DOM + SSL headers)
    if (raw.dom) {
      tsMetrics.push(...raw.dom.legal.checks);
    }
    if (raw.headers) {
      tsMetrics.push(...extractLegalHeaderChecks(raw.headers));
    }

    // Security checks (from Lighthouse best-practices + security headers + API)
    if (raw.lighthouse) {
      const securityExtraction = extractSecurityChecks(raw.lighthouse);
      tsMetrics.push(...securityExtraction.metrics);
      tsOpportunities.push(...securityExtraction.opportunities);
      tsDiagnostics.push(...securityExtraction.diagnostics);
    }
    if (raw.headers) {
      tsMetrics.push(...extractSecurityHeaderChecks(raw.headers));
    }
    if (raw.api) {
      tsMetrics.push(...raw.api.securityChecks);
    }

    const tsSplit = splitErrorChecks(tsMetrics);

    if (tsSplit.scored.length > 0) {
      trustSecurity = buildCategoryResult({
        metrics: tsSplit.scored,
        opportunities: tsOpportunities,
        diagnostics: [
          ...tsDiagnostics,
          ...tsSplit.errors,
          ...(domError
            ? [
                buildTrackErrorCheck(
                  "trust-security-dom-error",
                  "Trust & Security DOM checks failed",
                  domError,
                ),
              ]
            : []),
          ...(lighthouseError
            ? [
                buildTrackErrorCheck(
                  "trust-security-lighthouse-error",
                  "Trust & Security lighthouse failed",
                  lighthouseError,
                ),
              ]
            : []),
          ...(headersError
            ? [
                buildTrackErrorCheck(
                  "trust-security-header-error",
                  "Trust & Security header checks failed",
                  headersError,
                ),
              ]
            : []),
        ],
      });
    } else if (tsSplit.errors.length > 0) {
      trustSecurity = buildErrorCategory(
        "trust-security-track-error",
        "Trust & Security scan failed",
        tsSplit.errors.map((check) => check.value).filter(Boolean).join("; "),
      );
    } else if (domError || lighthouseError || headersError) {
      trustSecurity = buildErrorCategory(
        "trust-security-track-error",
        "Trust & Security scan failed",
        [domError, lighthouseError, headersError].filter(Boolean).join("; "),
      );
    }
  }

  // Standards: DOM checks + link checks
  let standards: CategoryResult | null = null;
  {
    const standardsDomChecks = raw.dom?.standards.checks ?? [];
    const linkChecks = raw.links?.checks ?? [];
    const allStandardsChecks = [...standardsDomChecks, ...linkChecks];
    const standardsSplit = splitErrorChecks(allStandardsChecks);

    if (standardsSplit.scored.length > 0) {
      standards = buildCategoryResult({
        metrics: standardsSplit.scored,
        diagnostics: [
          ...standardsSplit.errors,
          ...(domError
            ? [
                buildTrackErrorCheck(
                  "standards-dom-error",
                  "Standards DOM checks failed",
                  domError,
                ),
              ]
            : []),
        ],
      });
    } else if (standardsSplit.errors.length > 0) {
      standards = buildErrorCategory(
        "standards-track-error",
        "Standards scan failed",
        standardsSplit.errors
          .map((check) => check.value)
          .filter(Boolean)
          .join("; "),
      );
    } else if (domError) {
      standards = buildErrorCategory(
        "standards-track-error",
        "Standards scan failed",
        domError,
      );
    }
  }

  // AI Readiness: DOM checks + HTTP checks (robots.txt, llms.txt, SSR)
  const aiReadinessHttpError = raw.trackErrors?.aiReadinessHttp ?? null;
  let aiReadiness: CategoryResult | null = null;
  {
    const aiMetrics: CheckResult[] = [];
    const aiDiagnostics: CheckResult[] = [];

    // DOM checks
    if (raw.dom) {
      aiMetrics.push(...raw.dom.aiReadiness.checks);
    }

    // HTTP checks (robots.txt, llms.txt)
    if (raw.aiReadinessHttp) {
      aiMetrics.push(...raw.aiReadinessHttp.checks);
    }

    // SSR check: compare raw HTML text against Playwright-rendered text
    if (raw.dom && raw.aiReadinessHttp?.rawTextContent != null) {
      const renderedWords = raw.dom.renderedTextContent.split(/\s+/).filter((w) => w.length > 0).length;
      const rawWords = raw.aiReadinessHttp.rawTextContent.split(/\s+/).filter((w) => w.length > 0).length;

      if (renderedWords > 0) {
        const ratio = Math.round((rawWords / renderedWords) * 100);
        let status: "pass" | "warn" | "fail" = "pass";
        let value = `${ratio}% of content visible without JavaScript`;
        if (ratio < 50) {
          status = "fail";
          value = `Only ${ratio}% of content visible without JavaScript`;
        } else if (ratio < 90) {
          status = "warn";
        }

        aiMetrics.push(buildCheck(
          "ai-content-renderability",
          "Content Renderability (SSR)",
          status,
          value,
          2,
          "AI crawlers do not execute JavaScript. Content that requires JS to render is invisible to GPTBot, ClaudeBot, and PerplexityBot.",
        ));
      }
    }

    const aiSplit = splitErrorChecks(aiMetrics);

    if (aiSplit.scored.length > 0) {
      aiReadiness = buildCategoryResult({
        metrics: aiSplit.scored,
        diagnostics: [
          ...aiDiagnostics,
          ...aiSplit.errors,
          ...(domError
            ? [buildTrackErrorCheck("ai-readiness-dom-error", "AI Readiness DOM checks failed", domError)]
            : []),
          ...(aiReadinessHttpError
            ? [buildTrackErrorCheck("ai-readiness-http-error", "AI Readiness HTTP checks failed", aiReadinessHttpError)]
            : []),
        ],
      });
    } else if (aiSplit.errors.length > 0) {
      aiReadiness = buildErrorCategory(
        "ai-readiness-track-error",
        "AI Readiness scan failed",
        aiSplit.errors.map((check) => check.value).filter(Boolean).join("; "),
      );
    } else if (domError || aiReadinessHttpError) {
      aiReadiness = buildErrorCategory(
        "ai-readiness-track-error",
        "AI Readiness scan failed",
        [domError, aiReadinessHttpError].filter(Boolean).join("; "),
      );
    }
  }

  const categories = {
    performance,
    seo,
    accessibility,
    trustSecurity,
    standards,
    aiReadiness,
  };

  const overallScore = calculateOverallScore(categories);
  const finalUrl = raw.lighthouse?.finalDisplayedUrl ?? url;

  const details: ScanDetailsV1 = {
    version: 1,
    url: finalUrl,
    scannedAt: new Date().toISOString(),
    ...categories,
  };

  return { overallScore, finalUrl, details };
}
