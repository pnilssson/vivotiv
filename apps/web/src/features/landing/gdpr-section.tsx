"use client";

import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { ContentCard, ContentCardGrid } from "@/components/content-card";
import { Link } from "@/i18n/navigation";

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
          <ContentCardGrid className="order-2 flex-col lg:order-1">
            {stats.map((stat, i) => (
              <motion.div
                key={stat}
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + i * 0.1,
                  ease: "easeOut",
                }}
              >
                <ContentCard>
                  <div className="font-heading text-3xl font-bold tracking-tight">
                    {t(`${stat}.value`)}
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    {t(`${stat}.label`)}
                  </p>
                </ContentCard>
              </motion.div>
            ))}
          </ContentCardGrid>

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
              <Button variant="outline" nativeButton={false} className="border-brand text-brand hover:bg-brand/10 hover:text-brand" render={<Link href="/privacy-compliance" />}>
                {t("cta")}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
