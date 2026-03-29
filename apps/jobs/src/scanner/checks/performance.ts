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
  if (!details || !("items" in details)) return [];

  const items = details.items as Array<Record<string, unknown>>;
  return items
    .slice(0, 10)
    .map((item) => {
      const url = item.url as string | undefined;
      return url ?? String(item.label ?? "");
    })
    .filter(Boolean);
}

function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function extractPerformanceChecks(
  lhr: LighthouseResult,
): { checks: CheckResult[]; lighthouseScore: number | null } {
  const category = lhr.categories[CATEGORY_ID];
  if (!category) {
    return { checks: [], lighthouseScore: null };
  }

  const weightByAuditId = new Map<string, number>();
  for (const ref of category.auditRefs) {
    if (ref.weight > 0) {
      weightByAuditId.set(ref.id, ref.weight);
    }
  }

  const checks: CheckResult[] = [];

  for (const [auditId, auditWeight] of weightByAuditId) {
    const audit = lhr.audits[auditId];
    if (!audit) continue;

    if (SKIPPED_DISPLAY_MODES.has(audit.scoreDisplayMode)) continue;

    if (audit.scoreDisplayMode === "error") {
      checks.push({
        id: auditId,
        name: audit.title,
        status: "error",
        score: null,
        value: audit.errorMessage ?? "Audit could not be run",
        rawValue: null,
        rawUnit: null,
        scoreThresholds: null,
        weight: clampWeight(auditWeight),
        description: stripMarkdownLinks(audit.description),
        recommendation: null,
        items: null,
      });
      continue;
    }

    const status = lighthouseScoreToStatus(audit.score);
    const score = audit.score !== null ? Math.round(audit.score * 100) : null;
    const items = extractItems(audit);

    checks.push({
      id: auditId,
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
      weight: clampWeight(auditWeight),
      description: stripMarkdownLinks(audit.description),
      recommendation:
        status === "pass"
          ? null
          : (audit.explanation ?? stripMarkdownLinks(audit.description)),
      items: items.length > 0 ? items : null,
    });
  }

  return {
    checks,
    lighthouseScore:
      category.score !== null ? Math.round(category.score * 100) : null,
  };
}

function clampWeight(weight: number): 1 | 2 | 3 {
  if (weight <= 1) return 1;
  if (weight <= 2) return 2;
  return 3;
}

function formatScoringOption(
  value: number,
  unit: string | undefined,
): string {
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
