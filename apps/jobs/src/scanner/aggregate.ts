import type {
  CategoryResult,
  CheckResult,
  ScanDetailsV1,
} from "@vivotiv/shared";

import {
  extractLegalHeaderChecks,
  extractPerformanceChecks,
  extractSecurityChecks,
  extractSecurityHeaderChecks,
  extractSeoChecks,
} from "./checks";
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
  trackErrors?: {
    lighthouse?: string | null;
    dom?: string | null;
    headers?: string | null;
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

  // Legal: DOM checks + SSL from headers
  let legal: CategoryResult | null = null;
  {
    const legalDomChecks = raw.dom?.legal.checks ?? [];
    const legalHeaderChecks = raw.headers
      ? extractLegalHeaderChecks(raw.headers)
      : [];
    const allLegalMetrics = [...legalDomChecks, ...legalHeaderChecks];
    const legalSplit = splitErrorChecks(allLegalMetrics);

    if (legalSplit.scored.length > 0) {
      legal = buildCategoryResult({
        metrics: legalSplit.scored,
        diagnostics: [
          ...legalSplit.errors,
          ...(domError
            ? [
                buildTrackErrorCheck(
                  "legal-dom-error",
                  "Legal DOM checks failed",
                  domError,
                ),
              ]
            : []),
          ...(headersError
            ? [
                buildTrackErrorCheck(
                  "legal-header-error",
                  "Legal header checks failed",
                  headersError,
                ),
              ]
            : []),
        ],
      });
    } else if (legalSplit.errors.length > 0) {
      legal = buildErrorCategory(
        "legal-track-error",
        "Legal scan failed",
        legalSplit.errors.map((check) => check.value).filter(Boolean).join("; "),
      );
    } else if (domError || headersError) {
      legal = buildErrorCategory(
        "legal-track-error",
        "Legal scan failed",
        [domError, headersError].filter(Boolean).join("; "),
      );
    }
  }

  // Security: Lighthouse best-practices + header checks
  let security: CategoryResult | null = null;
  {
    const secMetrics: CheckResult[] = [];
    const secOpportunities: CheckResult[] = [];
    const secDiagnostics: CheckResult[] = [];
    if (raw.lighthouse) {
      const securityExtraction = extractSecurityChecks(raw.lighthouse);
      secMetrics.push(...securityExtraction.metrics);
      secOpportunities.push(...securityExtraction.opportunities);
      secDiagnostics.push(...securityExtraction.diagnostics);
    }
    if (raw.headers) {
      secMetrics.push(...extractSecurityHeaderChecks(raw.headers));
    }
    if (raw.api) {
      secMetrics.push(...raw.api.securityChecks);
    }
    const securitySplit = splitErrorChecks(secMetrics);

    if (securitySplit.scored.length > 0) {
      security = buildCategoryResult({
        metrics: securitySplit.scored,
        opportunities: secOpportunities,
        diagnostics: [
          ...secDiagnostics,
          ...securitySplit.errors,
          ...(lighthouseError
            ? [
                buildTrackErrorCheck(
                  "security-lighthouse-error",
                  "Security lighthouse failed",
                  lighthouseError,
                ),
              ]
            : []),
          ...(headersError
            ? [
                buildTrackErrorCheck(
                  "security-header-error",
                  "Security header checks failed",
                  headersError,
                ),
              ]
            : []),
        ],
      });
    } else if (securitySplit.errors.length > 0) {
      security = buildErrorCategory(
        "security-track-error",
        "Security scan failed",
        securitySplit.errors.map((check) => check.value).filter(Boolean).join("; "),
      );
    } else if (lighthouseError || headersError) {
      security = buildErrorCategory(
        "security-track-error",
        "Security scan failed",
        [lighthouseError, headersError].filter(Boolean).join("; "),
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

  const categories = {
    performance,
    seo,
    accessibility,
    legal,
    security,
    standards,
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
