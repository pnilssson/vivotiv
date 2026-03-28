"use client";

import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

const stats = ["stat1", "stat2", "stat3"] as const;

export function GdprSection() {
  const t = useTranslations("gdpr");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 md:py-36" ref={ref} aria-labelledby="gdpr-heading">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left on desktop: stats */}
          <div className="order-2 flex flex-col gap-px border border-border bg-border lg:order-1">
            {stats.map((stat, i) => (
              <motion.div
                key={stat}
                className="bg-card p-8 transition-colors hover:bg-depth-1"
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + i * 0.1,
                  ease: "easeOut",
                }}
              >
                <div className="font-heading text-3xl font-bold tracking-tight">
                  {t(`${stat}.value`)}
                </div>
                <p className="mt-2 text-muted-foreground">
                  {t(`${stat}.label`)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right on desktop: copy */}
          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("pretitle")}</p>
            <motion.h2
              id="gdpr-heading"
              className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-4xl"
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {t("title")}
            </motion.h2>

            <motion.p
              className="mt-6 text-lg text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            >
              {t("description")}
            </motion.p>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <a
                href="#scan"
                className="text-sm font-medium text-brand transition-colors hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {t("cta")}
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
