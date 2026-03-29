import type { CheckResult } from "@vivotiv/shared";

import type { LighthouseResult } from "../lighthouse";

const CATEGORY_ID = "performance";

const SKIPPED_DISPLAY_MODES = new Set([
  "manual",
  "notApplicable",
  "informative",
]);

function lighthouseScoreToStatus(
  score: number | null,
): "pass" | "warn" | "fail" | "error" {
  if (score === null) return "error";
  if (score >= 0.9) return "pass";
  if (score >= 0.5) return "warn";
  return "fail";
}

function extractItems(audit: LighthouseResult["audits"][string]): string[] {
  const details = audit.details;
  if (!details || !("items" in details) || !Array.isArray(details.items)) {
    return [];
  }

  return details.items
    .slice(0, 10)
    .map((item: Record<string, unknown>) => {
      const url = item.url as string | undefined;
      return url ?? String(item.label ?? "");
    })
    .filter(Boolean);
}

function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function auditToCheckResult(
  audit: LighthouseResult["audits"][string],
  weight: 1 | 2 | 3,
): CheckResult | null {
  if (SKIPPED_DISPLAY_MODES.has(audit.scoreDisplayMode)) return null;

  if (audit.scoreDisplayMode === "error") {
    return {
      id: audit.id,
      name: audit.title,
      status: "error",
      score: null,
      value: audit.errorMessage ?? "Audit could not be run",
      rawValue: null,
      rawUnit: null,
      scoreThresholds: null,
      weight,
      description: stripMarkdownLinks(audit.description),
      recommendation: null,
      items: null,
    };
  }

  const status = lighthouseScoreToStatus(audit.score);
  const score = audit.score !== null ? Math.round(audit.score * 100) : null;
  const items = extractItems(audit);

  return {
    id: audit.id,
    name: audit.title,
    status,
    score,
    value: audit.displayValue ?? null,
    rawValue: audit.numericValue ?? null,
    rawUnit: audit.numericUnit ?? null,
    scoreThresholds: audit.scoringOptions
      ? {
          good: formatScoringOption(
            audit.scoringOptions.p10,
            audit.numericUnit,
          ),
          warn: formatScoringOption(
            audit.scoringOptions.median,
            audit.numericUnit,
          ),
        }
      : null,
    weight,
    description: stripMarkdownLinks(audit.description),
    recommendation:
      status === "pass"
        ? null
        : (audit.explanation ?? stripMarkdownLinks(audit.description)),
    items: items.length > 0 ? items : null,
  };
}

export interface PerformanceExtraction {
  metrics: CheckResult[];
  opportunities: CheckResult[];
  diagnostics: CheckResult[];
  lighthouseScore: number | null;
}

export function extractPerformanceChecks(
  lhr: LighthouseResult,
): PerformanceExtraction {
  const category = lhr.categories[CATEGORY_ID];
  if (!category) {
    return { metrics: [], opportunities: [], diagnostics: [], lighthouseScore: null };
  }

  const metrics: CheckResult[] = [];
  const opportunities: CheckResult[] = [];
  const diagnostics: CheckResult[] = [];

  for (const ref of category.auditRefs) {
    const audit = lhr.audits[ref.id];
    if (!audit) continue;

    const details = audit.details as Record<string, unknown> | undefined;
    const hasOpportunitySavings =
      details?.type === "opportunity" ||
      (details?.overallSavingsMs as number) > 0;

    if (ref.weight > 0) {
      const check = auditToCheckResult(audit, clampWeight(ref.weight));
      if (check) metrics.push(check);
    } else if (hasOpportunitySavings) {
      const check = auditToCheckResult(audit, 1);
      if (check) opportunities.push(check);
    } else {
      const check = auditToCheckResult(audit, 1);
      if (check) diagnostics.push(check);
    }
  }

  // Sort opportunities by score ascending (worst first)
  opportunities.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

  // Sort diagnostics by score ascending (worst first)
  diagnostics.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

  return {
    metrics,
    opportunities,
    diagnostics,
    lighthouseScore:
      category.score !== null ? Math.round(category.score * 100) : null,
  };
}

function clampWeight(weight: number): 1 | 2 | 3 {
  if (weight <= 1) return 1;
  if (weight <= 2) return 2;
  return 3;
}

function formatScoringOption(value: number, unit: string | undefined): string {
  if (unit === "millisecond") {
    return value >= 1000
      ? `${(value / 1000).toFixed(1)} s`
      : `${Math.round(value)} ms`;
  }
  if (unit === "byte") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} MB`;
    return `${(value / 1_000).toFixed(0)} KB`;
  }
  return String(value);
}
