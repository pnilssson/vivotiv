"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { ScanCategoryKey } from "@vivotiv/shared";

import { useTickingNumber } from "@/lib/use-ticking-number";
import { useAverageScores } from "./use-average-scores";

function scoreColor(score: number) {
  if (score <= 40) return "text-red-500";
  if (score <= 70) return "text-orange-400";
  return "text-green-500";
}

function barColor(score: number) {
  if (score <= 40) return "bg-red-500";
  if (score <= 70) return "bg-orange-400";
  return "bg-green-500";
}

const categories: ScanCategoryKey[] = [
  "performance",
  "seo",
  "accessibility",
  "legal",
  "security",
  "standards",
];

function ScoreCard({
  label,
  score,
  index,
  isInView,
}: {
  label: string;
  score: number;
  index: number;
  isInView: boolean;
}) {
  const numberRef = useTickingNumber({ value: score, delay: index * 0.1, isInView });

  return (
    <div className="flex flex-col gap-2 bg-card p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-lg font-semibold tabular-nums ${scoreColor(score)}`}>
          <span ref={numberRef}>0</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full ${barColor(score)}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${score}%` } : { width: 0 }}
          transition={{
            duration: 0.8,
            delay: index * 0.1,
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  );
}

export function HeroScoresCustom() {
  const { scores } = useAverageScores();
  const t = useTranslations("categories");
  const tHero = useTranslations("hero");
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShouldAnimate(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3"
    >
      <div className="col-span-2 bg-card p-5 sm:col-span-3">
        <h3 className="font-heading text-sm font-semibold">
          {tHero("averageScoresLabel")}
        </h3>
      </div>
      {categories.map((key, i) => (
        <ScoreCard
          key={key}
          label={t(`${key}.title`)}
          score={scores[key]}
          index={i}
          isInView={shouldAnimate}
        />
      ))}
    </div>
  );
}
