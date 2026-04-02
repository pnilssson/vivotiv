import type {
  CategoryResult,
  CheckResult,
  CheckStatus,
  ScanCategoryKey,
} from "@vivotiv/shared";

import type { AccessibilityResults } from "./checks/accessibility";

const CATEGORY_WEIGHTS: Record<ScanCategoryKey, number> = {
  performance: 0.2,
  seo: 0.2,
  accessibility: 0.2,
  trustSecurity: 0.2,
  standards: 0.1,
  aiReadiness: 0.1,
};

export function getTrafficLight(score: number): CheckStatus {
  if (score < 50) return "fail";
  if (score < 90) return "warn";
  return "pass";
}

export function calculateCategoryScore(checks: CheckResult[]): number {
  let earned = 0;
  let maxWeight = 0;

  for (const check of checks) {
    if (check.status === "error") continue;

    maxWeight += check.weight;

    if (check.score !== null) {
      earned += (check.score / 100) * check.weight;
    } else {
      if (check.status === "pass") earned += check.weight;
      else if (check.status === "warn") earned += check.weight * 0.5;
    }
  }

  if (maxWeight === 0) return 0;
  return Math.round((earned / maxWeight) * 100);
}

export function buildCategoryResult(input: {
  metrics: CheckResult[];
  opportunities?: CheckResult[];
  diagnostics?: CheckResult[];
}): CategoryResult {
  const score = calculateCategoryScore(input.metrics);
  return {
    score,
    status: getTrafficLight(score),
    metrics: input.metrics,
    opportunities: input.opportunities ?? [],
    diagnostics: input.diagnostics ?? [],
  };
}

const VIOLATION_PENALTY: Record<string, number> = {
  critical: 15,
  serious: 10,
  moderate: 5,
  minor: 2,
};

export function buildErrorCategory(
  id: string,
  name: string,
  reason: string,
): CategoryResult {
  return {
    score: 0,
    status: "error",
    metrics: [],
    opportunities: [],
    diagnostics: [
      {
        id,
        name,
        status: "error",
        score: null,
        value: reason,
        rawValue: null,
        rawUnit: null,
        scoreThresholds: null,
        weight: 1,
        description: "Category could not be fully analyzed",
        items: null,
      },
    ],
  };
}

function getImpactFromViolation(violation: CheckResult): keyof typeof VIOLATION_PENALTY {
  const match = violation.description.match(/^Impact:\s*(critical|serious|moderate|minor)\.?/i);
  if (match?.[1]) {
    return match[1].toLowerCase() as keyof typeof VIOLATION_PENALTY;
  }

  if (violation.weight === 3) return "critical";
  if (violation.weight === 2) return "serious";
  return "moderate";
}

export function buildAccessibilityResult(
  a11y: AccessibilityResults,
): CategoryResult {
  if (a11y.error) {
    return buildErrorCategory(
      "accessibility-track-error",
      "Accessibility analysis failed",
      a11y.error,
    );
  }

  const violations = a11y.violations.filter((v) => v.status !== "error");
  const violationErrors = a11y.violations.filter((v) => v.status === "error");

  let totalPenalty = 0;
  for (const violation of violations) {
    const nodeCount = Math.max(1, violation.rawValue ?? 1);
    const impact = getImpactFromViolation(violation);

    // Cap per-rule node multiplier so repeated instances do not fully dominate score.
    totalPenalty += (VIOLATION_PENALTY[impact] ?? 5) * Math.min(nodeCount, 5);
  }

  const score = Math.max(0, 100 - totalPenalty);

  if (violations.length === 0 && violationErrors.length > 0) {
    return buildErrorCategory(
      "accessibility-track-error",
      "Accessibility analysis failed",
      "Axe-core could not complete successfully for this page",
    );
  }

  return {
    score,
    status: getTrafficLight(score),
    metrics: violations,
    opportunities: [],
    diagnostics: [...a11y.incomplete, ...violationErrors],
  };
}

export function calculateOverallScore(
  categories: Partial<Record<ScanCategoryKey, CategoryResult | null>>,
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const key of Object.keys(CATEGORY_WEIGHTS) as ScanCategoryKey[]) {
    const result = categories[key];
    if (!result) continue;

    const weight = CATEGORY_WEIGHTS[key];
    weightedSum += result.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}
