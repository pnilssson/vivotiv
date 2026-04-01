"use client";

import type {
  CategoryResult,
  CheckResult,
  ScanCategoryKey,
} from "@vivotiv/shared";
import { scanCategoryKeys } from "@vivotiv/shared";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { scoreBorder, scoreColor } from "@/lib/score-color";

type CheckListProps = {
  categories: Record<ScanCategoryKey, CategoryResult | null>;
  showPassing: boolean;
};

const StatusIcon = {
  fail: XCircle,
  warn: AlertTriangle,
  pass: CheckCircle2,
  error: CircleAlert,
};

const statusColor = {
  fail: "text-red-700",
  warn: "text-yellow-800",
  pass: "text-emerald-700",
  error: "text-muted-foreground",
};

const statusLabelKey = {
  fail: "statusFail",
  warn: "statusWarn",
  pass: "statusPass",
  error: "statusError",
} as const;

const statusOrder: Record<string, number> = {
  fail: 0,
  error: 1,
  warn: 2,
  pass: 3,
};

function sortByStatus(checks: CheckResult[]): CheckResult[] {
  return [...checks].sort(
    (a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3),
  );
}

function CheckItem({
  check,
  index,
  categoryKey,
}: {
  check: CheckResult;
  index: number;
  categoryKey: ScanCategoryKey;
}) {
  const t = useTranslations("scanResults");
  const [open, setOpen] = useState(false);
  const Icon = StatusIcon[check.status];
  const panelId = `check-panel-${check.id}-${index}`;
  const showImpact = check.status === "fail" || check.status === "warn";

  return (
    <div
      className={`border border-border ${check.status === "fail" ? "bg-red-700/5" : "bg-card"}`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Icon
          className={`mt-0.5 h-4 w-4 shrink-0 ${statusColor[check.status]}`}
          aria-hidden="true"
        />
        <span className="sr-only">{t(statusLabelKey[check.status])}:</span>
        <div className="min-w-0 flex-1">
          <span className="text-sm">{check.name}</span>
          {check.value && (
            <span className="mt-0.5 block text-xs text-muted-foreground sm:mt-0 sm:inline sm:ml-2">
              {check.value}
            </span>
          )}
        </div>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-3 pb-3 pt-2">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {check.description}
              </p>
              {check.items && check.items.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {check.items.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {showImpact && (
                <p className="mt-2 text-xs font-medium text-foreground/70">
                  {t(`checkImpact.${categoryKey}`)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckGroup({
  label,
  checks,
  showPassing,
  categoryKey,
}: {
  label: string;
  checks: CheckResult[];
  showPassing: boolean;
  categoryKey: ScanCategoryKey;
}) {
  const visible = showPassing
    ? checks
    : checks.filter((c) => c.status !== "pass");
  if (visible.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col gap-2">
        {visible.map((check, i) => (
          <CheckItem key={`${check.id}-${i}`} check={check} index={i} categoryKey={categoryKey} />
        ))}
      </div>
    </div>
  );
}

function CategorySection({
  categoryKey,
  result,
  showPassing,
}: {
  categoryKey: ScanCategoryKey;
  result: CategoryResult;
  showPassing: boolean;
}) {
  const t = useTranslations("scanResults");
  const tc = useTranslations("categories");

  const allChecks = [...result.metrics, ...result.opportunities, ...result.diagnostics];
  const failCount = allChecks.filter((c) => c.status === "fail").length;
  const warnCount = allChecks.filter((c) => c.status === "warn").length;
  const passCount = allChecks.filter((c) => c.status === "pass").length;

  return (
    <div id={`category-${categoryKey}`} className="scroll-mt-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            {tc(`${categoryKey}.title`)}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            {failCount > 0 && (
              <span className="text-red-700">{t("failCount", { count: failCount })}</span>
            )}
            {warnCount > 0 && (
              <span className="text-yellow-800">{t("warnCount", { count: warnCount })}</span>
            )}
            {passCount > 0 && (
              <span className="text-emerald-700">{t("passCount", { count: passCount })}</span>
            )}
          </div>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${scoreBorder(result.score)}`}
          role="img"
          aria-label={`${tc(`${categoryKey}.title`)}: ${result.score}/100`}
        >
          <span className={`font-heading text-sm font-bold tabular-nums ${scoreColor(result.score)}`} aria-hidden="true">
            {result.score}
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-6">
        <CheckGroup label={t("metrics")} checks={sortByStatus(result.metrics)} showPassing={showPassing} categoryKey={categoryKey} />
        <CheckGroup label={t("opportunities")} checks={sortByStatus(result.opportunities)} showPassing={showPassing} categoryKey={categoryKey} />
        <CheckGroup label={t("diagnostics")} checks={sortByStatus(result.diagnostics)} showPassing={showPassing} categoryKey={categoryKey} />
      </div>
    </div>
  );
}

export function CheckList({ categories, showPassing }: CheckListProps) {
  const t = useTranslations("scanResults");

  const activeCategories = scanCategoryKeys.filter(
    (key) => categories[key] !== null,
  );

  if (activeCategories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("noChecks")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {activeCategories.map((key) => (
        <CategorySection
          key={key}
          categoryKey={key}
          result={categories[key]!}
          showPassing={showPassing}
        />
      ))}
    </div>
  );
}
