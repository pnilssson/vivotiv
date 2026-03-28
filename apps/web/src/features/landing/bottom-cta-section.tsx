"use client";

import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export function BottomCtaSection() {
  const t = useTranslations("bottomCta");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  function scrollToTop() {
    document.getElementById("scan")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="py-32 md:py-44" ref={ref} aria-labelledby="bottom-cta-heading">
      <motion.div
        className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 id="bottom-cta-heading" className="font-heading text-3xl font-bold tracking-tight md:text-5xl">
          {t("title")}
        </h2>
        <p className="mt-6 text-lg opacity-70">{t("subtitle")}</p>
        <button
          type="button"
          onClick={scrollToTop}
          className="mt-10 inline-flex h-12 items-center rounded-lg border border-current/20 bg-background px-8 text-base font-medium text-foreground transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {t("button")}
        </button>
      </motion.div>
    </section>
  );
}
