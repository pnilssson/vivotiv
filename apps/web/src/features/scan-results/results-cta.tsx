"use client";

import { usePostHog } from "@posthog/next";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";

type ResultsCtaProps = {
  overallScore: number;
};

export function ResultsCta({ overallScore }: ResultsCtaProps) {
  const t = useTranslations("scanResults.cta");
  const posthog = usePostHog();

  return (
    <section className="mt-16 border-t border-border pt-12" aria-labelledby="results-cta-heading">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {t("pretitle")}
        </p>
        <h2 id="results-cta-heading" className="mt-3 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {overallScore < 90 ? t("titleIssues") : t("titleGood")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {overallScore < 90 ? t("descriptionIssues") : t("descriptionGood")}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="mailto:hello@vivotiv.com?subject=Website scan results"
            onClick={() =>
              posthog?.capture("results_cta_clicked", {
                type: "contact",
                score: overallScore,
              })
            }
            className="inline-flex h-10 items-center gap-2 rounded-[min(var(--radius-md),12px)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {t("contactButton")}
          </a>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>{t("trust")}</span>
        </div>
      </div>
    </section>
  );
}
