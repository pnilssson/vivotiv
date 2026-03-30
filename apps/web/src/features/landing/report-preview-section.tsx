"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

const categoryKeys = [
  "legal",
  "accessibility",
  "seo",
  "performance",
  "security",
  "standards",
] as const;

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

const statusLabelKey = {
  fail: "statusFail",
  warn: "statusWarn",
  pass: "statusPass",
} as const;

type Issue = {
  status: "fail" | "warn" | "pass";
  label: string;
  detail: string;
};

const exampleIssues: Issue[] = [
  {
    status: "fail",
    label: "LCP: 4.2s (target: <2.5s)",
    detail:
      "Largest Contentful Paint measures how long it takes for the main content to appear. Your page takes 4.2 seconds, nearly double the recommended 2.5s threshold. This directly affects your Google ranking and causes visitors to leave before the page loads.",
  },
  {
    status: "fail",
    label: "No cookie consent banner detected",
    detail:
      "No cookie consent mechanism was found on your site. Under GDPR and the ePrivacy Directive, you must obtain consent before setting non-essential cookies. Without a banner, any analytics or marketing tracking on your site is a violation.",
  },
  {
    status: "warn",
    label: "Images served as PNG, not WebP/AVIF",
    detail:
      "Your images are served in PNG format, which is significantly larger than modern formats like WebP or AVIF. Switching formats can reduce image size by 30-50%, improving load times and reducing bandwidth costs.",
  },
  {
    status: "warn",
    label: "Missing meta description",
    detail:
      "Your page has no meta description tag. Search engines use this to generate the snippet shown in search results. Without it, Google will pick a random passage from your page, which often looks unprofessional and reduces click-through rates.",
  },
  {
    status: "pass",
    label: "Valid SSL certificate",
    detail:
      "Your site has a valid SSL certificate and is served over HTTPS. This is the baseline for secure communication between your site and its visitors.",
  },
  {
    status: "pass",
    label: "Responsive viewport configured",
    detail:
      "Your site has a proper viewport meta tag configured, which means it adapts to different screen sizes. This is essential for mobile usability and Google's mobile-first indexing.",
  },
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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const scores = categoryKeys.map((key) => ({
    key,
    label: tc(`${key}.title`),
    score: Number(t(`example.${key}`)),
  }));

  const overall = Math.round(
    scores.reduce((sum, s) => sum + s.score, 0) / scores.length,
  );

  function toggleIssue(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className="py-28 md:py-36" ref={ref} aria-labelledby="report-preview-heading">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("pretitle")}</p>
          <motion.h2
            id="report-preview-heading"
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
          className="mx-auto mt-16 max-w-5xl overflow-hidden border border-border bg-card"
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
              vivotiv.com/scan/example
            </span>
          </div>

          <div className="grid md:grid-cols-5">
            {/* Left: Category cards */}
            <div className="border-b border-border p-6 md:col-span-2 md:border-b-0 md:border-r">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t("categoryScores")}
              </p>
              <div className="flex flex-col gap-2">
                {scores.map((item, i) => (
                  <motion.div
                    key={item.key}
                    className="flex flex-col gap-1.5 border border-border bg-background p-3"
                    initial={{ opacity: 0, x: -8 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.3,
                      delay: 0.4 + i * 0.06,
                      ease: "easeOut",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm font-semibold tabular-nums ${scoreColor(item.score)}`}
                        >
                          {item.score}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
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
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Example issues */}
            <div className="p-6 md:col-span-3">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t("issuesFound")}
              </p>
              <div className="flex flex-col gap-2">
                {exampleIssues.map((issue, i) => {
                  const Icon = StatusIcon[issue.status];
                  const isOpen = openIndex === i;
                  const panelId = `issue-panel-${i}`;
                  return (
                    <motion.div
                      key={i}
                      className={`border border-border ${issue.status === "fail" ? "bg-red-500/5" : "bg-background"}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.3,
                        delay: 0.5 + i * 0.07,
                        ease: "easeOut",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleIssue(i)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="flex w-full items-start gap-3 p-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <Icon
                          className={`mt-0.5 h-4 w-4 shrink-0 ${statusColor[issue.status]}`}
                          aria-hidden="true"
                        />
                        <span className="sr-only">{t(statusLabelKey[issue.status])}:</span>
                        <span className="min-w-0 flex-1 text-sm">{issue.label}</span>
                        <ChevronDown
                          className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
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
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {issue.detail}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
