import type { ScanCategoryKey } from "@vivotiv/shared";

type CategoryScores = Partial<Record<ScanCategoryKey, number | null>>;

export function shouldSendOutreach(
  overallScore: number | null,
  categoryScores: CategoryScores,
  findingsCount: number,
): { send: boolean; reason: string } {
  if (overallScore === null) {
    return { send: false, reason: "Scan produced no overall score" };
  }

  const scores = Object.values(categoryScores).filter(
    (s): s is number => s !== null && s !== undefined,
  );

  const hasAnyCritical = scores.some((s) => s < 50);
  if (hasAnyCritical) {
    return { send: true, reason: "At least one category is critical (below 50)" };
  }

  const allAbove70 = scores.every((s) => s >= 70);
  if (overallScore >= 80 && allAbove70) {
    return { send: false, reason: "Site scores well (overall 80+ and no category below 70)" };
  }

  if (findingsCount < 2) {
    return { send: false, reason: "Fewer than 2 meaningful findings" };
  }

  return { send: true, reason: "Score qualifies for outreach" };
}
