"use client";

import { usePostHog } from "@posthog/next";
import { Mail, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type StickyResultsBarProps = {
  overallScore: number;
};

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function scoreBorderColor(score: number): string {
  if (score >= 90) return "border-emerald-600";
  if (score >= 50) return "border-amber-500";
  return "border-red-500";
}

export function StickyResultsBar({ overallScore }: StickyResultsBarProps) {
  const t = useTranslations("scanResults");
  const posthog = usePostHog();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) return;

    function onScroll() {
      const overview = document.querySelector("[data-score-overview]");
      if (!overview) return;
      const rect = overview.getBoundingClientRect();
      setVisible(rect.bottom < 0);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 md:flex"
        >
          <div className="flex items-center gap-4 rounded-lg border border-border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${scoreBorderColor(overallScore)}`}
              >
                <span className={`font-heading text-xs font-bold tabular-nums ${scoreColor(overallScore)}`}>
                  {overallScore}
                </span>
              </div>
            </div>
            <a
              href="mailto:hello@vivotiv.com?subject=Website scan results"
              onClick={() =>
                posthog?.capture("results_cta_clicked", {
                  type: "sticky_bar",
                  score: overallScore,
                })
              }
              className="text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
            >
              {t("cta.contactButton")}
            </a>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("hidePassing")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
