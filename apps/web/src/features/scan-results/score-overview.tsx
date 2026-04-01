"use client";

import { type ScanCategoryKey, scanCategoryKeys } from "@vivotiv/shared";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type ScoreOverviewProps = {
  overallScore: number;
  categoryScores: Record<ScanCategoryKey, number | null>;
};

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-700";
  if (score >= 50) return "text-amber-700";
  return "text-red-700";
}

function scoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-600";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export function ScoreOverview({
  overallScore,
  categoryScores,
}: ScoreOverviewProps) {
  const t = useTranslations("scanResults");
  const tc = useTranslations("categories");

  return (
    <div data-score-overview>
      <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {t("categoryBreakdown")}
      </p>

      <div className="flex flex-col gap-2">
        {scanCategoryKeys.map((key) => {
          const score = categoryScores[key];
          if (score === null) return null;

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                document
                  .getElementById(`category-${key}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex flex-col gap-1.5 border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {tc(`${key}.title`)}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-semibold tabular-nums ${scoreColor(score)}`}
                  >
                    {score}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                </div>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${scoreBg(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              {score < 90 && (
                <span className="text-[0.7rem] leading-tight text-muted-foreground">
                  {t(`impact.${key}`)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
