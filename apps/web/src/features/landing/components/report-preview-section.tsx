"use client";

import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

const categoryKeys = [
  "performance",
  "seo",
  "accessibility",
  "legal",
  "security",
  "standards",
] as const;

function scoreColor(score: number): string {
  if (score >= 71) return "text-emerald-600";
  if (score >= 41) return "text-amber-500";
  return "text-red-500";
}

function scoreBg(score: number): string {
  if (score >= 71) return "bg-emerald-600";
  if (score >= 41) return "bg-amber-500";
  return "bg-red-500";
}

function scoreBgLight(score: number): string {
  if (score >= 71) return "bg-emerald-50 border-emerald-200";
  if (score >= 41) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

type Issue = {
  status: "fail" | "warn" | "pass";
  label: string;
};

const exampleIssues: Issue[] = [
  { status: "fail", label: "LCP: 4.2s (target: <2.5s)" },
  { status: "fail", label: "No cookie consent banner detected" },
  { status: "warn", label: "Images served as PNG, not WebP/AVIF" },
  { status: "warn", label: "Missing meta description" },
  { status: "pass", label: "Valid SSL certificate" },
  { status: "pass", label: "Responsive viewport configured" },
];

const StatusIcon = {
  fail: XCircle,
  warn: AlertTriangle,
  pass: CheckCircle2,
};

const statusColor = {
  fail: "text-red-500",
  warn: "text-amber-500",
  pass: "text-emerald-600",
};

export function ReportPreviewSection() {
  const t = useTranslations("reportPreview");
  const tc = useTranslations("categories");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const scores = categoryKeys.map((key) => ({
    key,
    label: tc(`${key}.title`),
    score: Number(t(`example.${key}`)),
  }));

  const overall = Math.round(
    scores.reduce((sum, s) => sum + s.score, 0) / scores.length,
  );

  return (
    <section className="py-28 md:py-36" ref={ref}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("pretitle")}</p>
          <motion.h2
            className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-4xl"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {t("title")}
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <motion.div
          className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-xl border border-border bg-card"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          {/* Top bar */}
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-border" />
            <div className="h-3 w-3 rounded-full bg-border" />
            <div className="h-3 w-3 rounded-full bg-border" />
            <span className="ml-3 text-xs text-muted-foreground">
              vivotiv.com/report/example
            </span>
          </div>

          <div className="grid md:grid-cols-5">
            {/* Left: Overall score + category bars */}
            <div className="border-b border-border p-6 md:col-span-2 md:border-b-0 md:border-r">
              {/* Overall score circle */}
              <div className="mb-8 flex flex-col items-center">
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-full border-4 ${scoreBgLight(overall)}`}
                >
                  <span
                    className={`font-heading text-3xl font-bold tabular-nums ${scoreColor(overall)}`}
                  >
                    {overall}
                  </span>
                </div>
                <span className="mt-3 text-sm text-muted-foreground">
                  {t("overallScore")}
                </span>
              </div>

              {/* Category scores */}
              <div className="flex flex-col gap-4">
                {scores.map((item, i) => (
                  <motion.div
                    key={item.key}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -8 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.3,
                      delay: 0.4 + i * 0.06,
                      ease: "easeOut",
                    }}
                  >
                    <span className="w-24 shrink-0 text-xs">
                      {item.label}
                    </span>
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={`absolute inset-y-0 left-0 rounded-full ${scoreBg(item.score)}`}
                        initial={{ width: 0 }}
                        animate={
                          isInView
                            ? { width: `${item.score}%` }
                            : { width: 0 }
                        }
                        transition={{
                          duration: 0.8,
                          delay: 0.5 + i * 0.08,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                    <span
                      className={`w-6 text-right text-xs font-semibold tabular-nums ${scoreColor(item.score)}`}
                    >
                      {item.score}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Example issues */}
            <div className="p-6 md:col-span-3">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                {t("issuesFound")}
              </p>
              <div className="flex flex-col gap-3">
                {exampleIssues.map((issue, i) => {
                  const Icon = StatusIcon[issue.status];
                  return (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                      initial={{ opacity: 0, y: 6 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.3,
                        delay: 0.5 + i * 0.07,
                        ease: "easeOut",
                      }}
                    >
                      <Icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${statusColor[issue.status]}`}
                      />
                      <span className="text-sm">{issue.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
