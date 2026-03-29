import type { ScanDetailsV1 } from "@vivotiv/shared";

import { extractPerformanceChecks } from "./checks";
import type { LighthouseResult } from "./lighthouse";
import { buildCategoryResult, calculateOverallScore } from "./scoring";

interface RawResults {
  lighthouse: LighthouseResult;
  // dom: DomCheckResults -- added with scans 3-6
  // headers: HeaderCheckResults -- added with security scan
}

export function aggregate(url: string, raw: RawResults) {
  const { checks, lighthouseScore } = extractPerformanceChecks(raw.lighthouse);
  const performance = buildCategoryResult(checks);

  if (lighthouseScore !== null) {
    performance.score = lighthouseScore;
  }

  const categories = {
    performance,
    seo: null,
    accessibility: null,
    legal: null,
    security: null,
    standards: null,
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
