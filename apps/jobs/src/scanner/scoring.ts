import type {
  CategoryResult,
  CheckResult,
  CheckStatus,
  ScanCategoryKey,
} from "@vivotiv/shared";

const CATEGORY_WEIGHTS: Record<ScanCategoryKey, number> = {
  performance: 0.2,
  seo: 0.2,
  accessibility: 0.2,
  legal: 0.2,
  security: 0.1,
  standards: 0.1,
};

export function getTrafficLight(score: number): CheckStatus {
  if (score <= 40) return "fail";
  if (score <= 70) return "warn";
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

export function buildCategoryResult(checks: CheckResult[]): CategoryResult {
  const score = calculateCategoryScore(checks);
  return {
    score,
    status: getTrafficLight(score),
    checks,
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
