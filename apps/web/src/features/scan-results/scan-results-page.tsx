"use client";

import type { CategoryResult, ScanCategoryKey } from "@vivotiv/shared";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { CheckList } from "./check-list";
import { ScoreOverview } from "./score-overview";
import { useScan } from "./use-scan";

type ScanResultsPageProps = {
  scanId: string;
};

export function ScanResultsPage({ scanId }: ScanResultsPageProps) {
  const t = useTranslations("scanResults");
  const { data: scan, isLoading, isError } = useScan(scanId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !scan) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {t("error.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("error.description")}
        </p>
        <Link
          href="/"
          className="mt-6 text-sm text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {t("error.backHome")}
        </Link>
      </div>
    );
  }

  const categoryScores: Record<ScanCategoryKey, number | null> = {
    performance: scan.performanceScore,
    seo: scan.seoScore,
    accessibility: scan.accessibilityScore,
    legal: scan.legalScore,
    security: scan.securityScore,
    standards: scan.standardsScore,
  };

  const categories: Record<ScanCategoryKey, CategoryResult | null> = {
    performance: scan.details?.performance ?? null,
    seo: scan.details?.seo ?? null,
    accessibility: scan.details?.accessibility ?? null,
    legal: scan.details?.legal ?? null,
    security: scan.details?.security ?? null,
    standards: scan.details?.standards ?? null,
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("backHome")}
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("scannedUrl")}: {scan.url}
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <ScoreOverview
            overallScore={scan.overallScore ?? 0}
            categoryScores={categoryScores}
          />
        </div>

        <div className="md:col-span-3">
          <CheckList categories={categories} />
        </div>
      </div>
    </div>
  );
}
