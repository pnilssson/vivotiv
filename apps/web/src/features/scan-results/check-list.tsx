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

type CheckListProps = {
  categories: Record<ScanCategoryKey, CategoryResult | null>;
};

const StatusIcon = {
  fail: XCircle,
  warn: AlertTriangle,
  pass: CheckCircle2,
  error: CircleAlert,
};

const statusColor = {
  fail: "text-red-500",
  warn: "text-amber-500",
  pass: "text-emerald-600",
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

function CheckItem({ check, index }: { check: CheckResult; index: number }) {
  const t = useTranslations("scanResults");
  const [open, setOpen] = useState(false);
  const Icon = StatusIcon[check.status];
  const panelId = `check-panel-${check.id}-${index}`;

  return (
    <div className="border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Icon
          className={`h-4 w-4 shrink-0 ${statusColor[check.status]}`}
          aria-hidden="true"
        />
        <span className="sr-only">{t(statusLabelKey[check.status])}:</span>
        <span className="flex-1 text-sm">{check.name}</span>
        {check.value && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {check.value}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
}: {
  label: string;
  checks: CheckResult[];
}) {
  if (checks.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col gap-2">
        {checks.map((check, i) => (
          <CheckItem key={`${check.id}-${i}`} check={check} index={i} />
        ))}
      </div>
    </div>
  );
}

function CategorySection({
  categoryKey,
  result,
}: {
  categoryKey: ScanCategoryKey;
  result: CategoryResult;
}) {
  const t = useTranslations("scanResults");
  const tc = useTranslations("categories");

  return (
    <div>
      <h3 className="font-heading text-lg font-semibold tracking-tight">
        {tc(`${categoryKey}.title`)}
      </h3>
      <div className="mt-4 flex flex-col gap-6">
        <CheckGroup label={t("metrics")} checks={sortByStatus(result.metrics)} />
        <CheckGroup label={t("opportunities")} checks={sortByStatus(result.opportunities)} />
        <CheckGroup label={t("diagnostics")} checks={sortByStatus(result.diagnostics)} />
      </div>
    </div>
  );
}

export function CheckList({ categories }: CheckListProps) {
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
        />
      ))}
    </div>
  );
}
