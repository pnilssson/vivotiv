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
    name: "WCAG 2.1",
    href: "https://www.w3.org/TR/WCAG21/",
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
    <section>
      {/* Hero content */}
      <div className="px-6 pb-48 pt-48 md:pb-64 md:pt-64">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <motion.h1
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
        <div className="mx-auto flex max-w-6xl items-stretch justify-center">
          <span className="hidden shrink-0 items-center border-x border-background/10 px-8 text-xs font-semibold uppercase tracking-widest opacity-50 lg:flex">
            {ts("label")}
          </span>
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2.5 border-r border-background/10 px-4 py-8 text-sm font-medium opacity-60 transition-opacity first:border-l first:lg:border-l-0 hover:opacity-100 lg:flex-none lg:px-8"
            >
              <tool.icon className="h-4 w-4 shrink-0" />
              {tool.name}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
