"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { ScanForm } from "@/features/scan/components/scan-form";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section aria-labelledby="hero-heading">
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
    </section>
  );
}
