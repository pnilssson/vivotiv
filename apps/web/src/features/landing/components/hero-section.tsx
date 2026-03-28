"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { ScanForm } from "@/features/scan/components/scan-form";

import { Flame, Scan, ShieldCheck, Gauge, Theater } from "lucide-react";

const tools = [
  {
    name: "Lighthouse",
    href: "https://developer.chrome.com/docs/lighthouse",
    icon: Flame,
  },
  {
    name: "axe-core",
    href: "https://github.com/dequelabs/axe-core",
    icon: Scan,
  },
  {
    name: "WCAG 2.2",
    href: "https://www.w3.org/TR/WCAG22/",
    icon: ShieldCheck,
  },
  {
    name: "PageSpeed",
    href: "https://pagespeed.web.dev/",
    icon: Gauge,
  },
  {
    name: "Playwright",
    href: "https://playwright.dev/",
    icon: Theater,
  },
] as const;

export function HeroSection() {
  const t = useTranslations("hero");
  const ts = useTranslations("socialProof");

  return (
    <section aria-labelledby="hero-heading">
      {/* Hero content */}
      <div className="px-6 pb-28 pt-28 md:pb-64 md:pt-64">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <motion.h1
            id="hero-heading"
            className="font-heading max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {t("headline")}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            {t("subheadline")}
          </motion.p>

          <motion.div
            className="mt-12 w-full max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <ScanForm variant="hero" />
          </motion.div>

          <motion.p
            className="mt-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {t("trust")}
          </motion.p>
        </div>
      </div>

      {/* Social proof strip */}
      <motion.div
        className="border-y border-foreground/10 bg-foreground text-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row sm:items-stretch sm:justify-center">
          <span className="flex shrink-0 items-center border-b border-background/10 px-6 py-4 text-xs font-semibold uppercase tracking-widest text-background/70 sm:border-b-0 sm:border-x sm:px-8 sm:py-0">
            {ts("label")}
          </span>
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 border-b border-background/10 px-6 py-4 text-sm font-medium text-background/75 transition-colors last:border-b-0 hover:text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:flex-1 sm:justify-center sm:border-b-0 sm:border-r sm:px-4 sm:py-8 sm:first:border-l sm:first:lg:border-l-0 lg:flex-none lg:px-8"
            >
              <tool.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {tool.name}
              <span className="sr-only">{ts("opensInNewTab")}</span>
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
