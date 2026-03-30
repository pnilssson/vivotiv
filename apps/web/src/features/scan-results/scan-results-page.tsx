"use client";

import type {
  CategoryResult,
  CheckResult,
  ScanCategoryKey,
} from "@vivotiv/shared";
import { scanCategoryKeys } from "@vivotiv/shared";
import { ChevronDown, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Switch } from "@/components/ui/switch";
import { Link } from "@/i18n/navigation";

import { CheckList } from "./check-list";
import { ResultsCta } from "./results-cta";
import { ScoreOverview } from "./score-overview";
import { StickyResultsBar } from "./sticky-results-bar";
import { useScan } from "./use-scan";

type ScanResultsPageProps = {
  scanId: string;
};

function countIssues(categories: Record<ScanCategoryKey, CategoryResult | null>) {
  let fail = 0;
  let warn = 0;
  let affectedCategories = 0;

  for (const key of scanCategoryKeys) {
    const cat = categories[key];
    if (!cat) continue;
    const allChecks: CheckResult[] = [
      ...cat.metrics,
      ...cat.opportunities,
      ...cat.diagnostics,
    ];
    const catFail = allChecks.filter((c) => c.status === "fail").length;
    const catWarn = allChecks.filter((c) => c.status === "warn").length;
    fail += catFail;
    warn += catWarn;
    if (catFail > 0 || catWarn > 0) affectedCategories++;
  }

  return { fail, warn, total: fail + warn, affectedCategories };
}

function headlineKey(score: number): "headlineCritical" | "headlineWarning" | "headlineGood" {
  if (score < 50) return "headlineCritical";
  if (score < 90) return "headlineWarning";
  return "headlineGood";
}

function summaryKey(score: number): "summaryCritical" | "summaryWarning" | "summaryGood" {
  if (score < 50) return "summaryCritical";
  if (score < 90) return "summaryWarning";
  return "summaryGood";
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function scoreStroke(score: number): string {
  if (score >= 90) return "stroke-emerald-600";
  if (score >= 50) return "stroke-amber-500";
  return "stroke-red-500";
}

const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ScoreRing({ score }: { score: number }) {
  const filled = (score / 100) * RING_CIRCUMFERENCE;
  const gap = RING_CIRCUMFERENCE - filled;

  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Background track */}
      <circle
        cx="48"
        cy="48"
        r={RING_RADIUS}
        fill="none"
        className="stroke-muted"
        strokeWidth="5"
      />
      {/* Filled arc: starts at top (rotate -90), goes counterclockwise (negative dash) */}
      <circle
        cx="48"
        cy="48"
        r={RING_RADIUS}
        fill="none"
        className={scoreStroke(score)}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${gap}`}
        strokeDashoffset={RING_CIRCUMFERENCE / 4}
        style={{ transform: "scaleX(-1)", transformOrigin: "center" }}
      />
    </svg>
  );
}

export function ScanResultsPage({ scanId }: ScanResultsPageProps) {
  const t = useTranslations("scanResults");
  const { data: scan, isLoading, isError } = useScan(scanId);
  const [showPassing, setShowPassing] = useState(false);
  const [scoringOpen, setScoringOpen] = useState(false);

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

  const overallScore = scan.overallScore ?? 0;
  const issues = countIssues(categories);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero */}
      <div className="mb-10 border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* Score ring */}
          <div className="relative flex shrink-0 flex-col items-center self-center sm:self-start">
            <div className="relative">
              <ScoreRing score={overallScore} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`font-heading text-3xl font-bold tabular-nums ${scoreColor(overallScore)}`}
                >
                  {overallScore}
                </span>
              </div>
            </div>
            <span className={`mt-2 text-xs font-medium ${scoreColor(overallScore)}`}>
              {t(overallScore >= 90 ? "scoreGood" : overallScore >= 50 ? "scoreWarning" : "scoreCritical")}
            </span>
          </div>

          {/* Headline + meta */}
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {t(headlineKey(overallScore))}
            </h1>
            <a
              href={scan.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block max-w-full truncate text-sm text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              {scan.url}
            </a>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {issues.total > 0 &&
                t("issueSummary", {
                  total: issues.total,
                  categories: issues.affectedCategories,
                  critical: issues.fail,
                }) + " "}
              {t(summaryKey(overallScore))}
            </p>
          </div>
        </div>

        {/* Scoring explanation accordion */}
        <div className="mt-6 sm:pl-32">
          <button
            type="button"
            onClick={() => setScoringOpen(!scoringOpen)}
            aria-expanded={scoringOpen}
            className="flex w-full items-center gap-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${scoringOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
            {t("scoringToggle")}
          </button>
          <AnimatePresence>
            {scoringOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
                  <p>{t("scoringExplanation")}</p>
                  <p>{t("scoringAccessibility")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2 md:sticky md:top-24 md:self-start">
          <ScoreOverview
            overallScore={overallScore}
            categoryScores={categoryScores}
          />
        </div>

        <div className="md:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t("detailedResults")}
            </p>
            <div className="flex items-center gap-2">
              <label
                htmlFor="show-passing"
                className="text-xs text-muted-foreground select-none"
              >
                {t("showPassing")}
              </label>
              <Switch
                id="show-passing"
                size="sm"
                checked={showPassing}
                onCheckedChange={setShowPassing}
              />
            </div>
          </div>
          <CheckList categories={categories} showPassing={showPassing} />
        </div>
      </div>

      <ResultsCta overallScore={overallScore} />
      <StickyResultsBar overallScore={overallScore} />
    </div>
  );
}
