"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { ScanForm } from "@/features/scan/scan-form";
import { HeroScoresCustom } from "./hero-scores-custom";

const ROTATE_INTERVAL_MS = 3000;

const wordVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export function HeroSection() {
  const t = useTranslations("hero");
  const baseWords = t("headlineBase").split(" ");
  const rotatingPhrases = t("rotatingPhrases").split(",");

  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % rotatingPhrases.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [rotatingPhrases.length]);

  return (
    <section aria-labelledby="hero-heading">
      <div className="px-6 pb-20 pt-20 md:pb-40 md:pt-40">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <motion.h1
            id="hero-heading"
            aria-label={t("headline")}
            className="font-heading max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.04 }}
          >
            {baseWords.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                variants={wordVariants}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {word}
                {"\u00A0"}
              </motion.span>
            ))}
            <motion.span
              className="block"
              variants={wordVariants}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotatingPhrases[phraseIndex]}
                  className="inline-block text-primary"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {rotatingPhrases[phraseIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            {t("subheadline")}
          </motion.p>

          <motion.div
            className="mt-12 w-full max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
          >
            <ScanForm variant="hero" />
          </motion.div>

          <div className="mt-6 flex gap-2">
            {(t.raw("trustPills") as string[]).map((pill, i) => (
              <motion.span
                key={pill}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.7 + i * 0.1,
                  ease: "easeOut",
                }}
              >
                {pill}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="mt-12 w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
          >
            <HeroScoresCustom />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
