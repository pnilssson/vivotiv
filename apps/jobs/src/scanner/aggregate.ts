import type { ScanDetailsV1 } from "@vivotiv/shared";

import {
  extractLegalHeaderChecks,
  extractPerformanceChecks,
  extractSecurityChecks,
  extractSecurityHeaderChecks,
  extractSeoChecks,
} from "./checks";
import type { DomCheckResults } from "./dom-checks";
import type { HeaderCheckResults } from "./header-checks";
import type { LighthouseResult } from "./lighthouse";
import {
  buildCategoryResult,
  calculateOverallScore,
  getTrafficLight,
} from "./scoring";

interface RawResults {
  lighthouse: LighthouseResult;
  dom: DomCheckResults;
  headers: HeaderCheckResults;
}

export function aggregate(url: string, raw: RawResults) {
  // Performance: Lighthouse only
  const perfExtraction = extractPerformanceChecks(raw.lighthouse);
  const performance = buildCategoryResult({
    metrics: perfExtraction.metrics,
    opportunities: perfExtraction.opportunities,
    diagnostics: perfExtraction.diagnostics,
  });
  if (perfExtraction.lighthouseScore !== null) {
    performance.score = perfExtraction.lighthouseScore;
    performance.status = getTrafficLight(perfExtraction.lighthouseScore);
  }

  // SEO: Lighthouse + DOM extras
  const seoExtraction = extractSeoChecks(raw.lighthouse);
  const seoDomChecks = raw.dom.seo.checks;
  const seo = buildCategoryResult({
    metrics: seoExtraction.metrics,
    opportunities: seoExtraction.opportunities,
    diagnostics: [...seoExtraction.diagnostics, ...seoDomChecks],
  });
  if (seoExtraction.lighthouseScore !== null) {
    seo.score = seoExtraction.lighthouseScore;
    seo.status = getTrafficLight(seoExtraction.lighthouseScore);
  }

  // Accessibility: axe-core only
  const accessibility = buildCategoryResult({
    metrics: raw.dom.accessibility.metrics,
  });

  // Legal: DOM checks + SSL from headers
  const legalHeaderChecks = extractLegalHeaderChecks(raw.headers);
  const legal = buildCategoryResult({
    metrics: [...raw.dom.legal.checks, ...legalHeaderChecks],
  });

  // Security: Lighthouse best-practices + header checks
  const securityExtraction = extractSecurityChecks(raw.lighthouse);
  const securityHeaderChecks = extractSecurityHeaderChecks(raw.headers);
  const security = buildCategoryResult({
    metrics: [...securityExtraction.metrics, ...securityHeaderChecks],
    opportunities: securityExtraction.opportunities,
    diagnostics: securityExtraction.diagnostics,
  });
  if (securityExtraction.lighthouseScore !== null) {
    security.score = securityExtraction.lighthouseScore;
    security.status = getTrafficLight(securityExtraction.lighthouseScore);
  }

  // Standards: DOM checks only
  const standards = buildCategoryResult({
    metrics: raw.dom.standards.checks,
  });

  const categories = {
    performance,
    seo,
    accessibility,
    legal,
    security,
    standards,
  };

  const overallScore = calculateOverallScore(categories);
  const finalUrl = raw.lighthouse.finalDisplayedUrl ?? url;

  const details: ScanDetailsV1 = {
    version: 1,
    url: finalUrl,
    scannedAt: new Date().toISOString(),
    ...categories,
  };

  return { overallScore, finalUrl, details };
}
