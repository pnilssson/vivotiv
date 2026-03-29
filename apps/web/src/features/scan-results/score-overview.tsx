"use client";

import { type ScanCategoryKey, scanCategoryKeys } from "@vivotiv/shared";
import { useTranslations } from "next-intl";

type ScoreOverviewProps = {
  overallScore: number;
  categoryScores: Record<ScanCategoryKey, number | null>;
};

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function scoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-600";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function scoreBorder(score: number): string {
  if (score >= 90) return "border-emerald-600";
  if (score >= 50) return "border-amber-500";
  return "border-red-500";
}

function scoreLevelKey(
  score: number,
): "scoreGood" | "scoreWarning" | "scoreCritical" {
  if (score >= 90) return "scoreGood";
  if (score >= 50) return "scoreWarning";
  return "scoreCritical";
}

export function ScoreOverview({
  overallScore,
  categoryScores,
}: ScoreOverviewProps) {
  const t = useTranslations("scanResults");
  const tc = useTranslations("categories");

  return (
    <div>
      <div className="mb-8 flex flex-col items-center">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full border-3 ${scoreBorder(overallScore)}`}
        >
          <span
            className={`font-heading text-3xl font-bold tabular-nums ${scoreColor(overallScore)}`}
          >
            {overallScore}
          </span>
        </div>
        <span className="mt-3 text-sm text-muted-foreground">
          {t("overallScore")}
        </span>
        <span className="sr-only">{t(scoreLevelKey(overallScore))}</span>
      </div>

      <div className="flex flex-col gap-4">
        {scanCategoryKeys.map((key) => {
          const score = categoryScores[key];
          if (score === null) return null;

          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs">
                {tc(`${key}.title`)}
              </span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${scoreBg(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span
                className={`w-6 text-right text-xs font-semibold tabular-nums ${scoreColor(score)}`}
              >
                {score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
