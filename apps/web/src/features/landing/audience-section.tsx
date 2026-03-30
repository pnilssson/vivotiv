"use client";

import { Briefcase, LineChart, Code, Users } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { ContentCard, ContentCardGrid } from "@/components/content-card";

const audiences = [
  { key: "business", icon: Briefcase },
  { key: "marketing", icon: LineChart },
  { key: "developer", icon: Code },
  { key: "agency", icon: Users },
] as const;

export function AudienceSection() {
  const t = useTranslations("audience");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 md:py-36" ref={ref} aria-labelledby="audience-heading">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("pretitle")}</p>
          <h2 id="audience-heading" className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <ContentCardGrid className="mt-16 grid-cols-1 sm:grid-cols-2">
          {audiences.map((audience, i) => {
            const Icon = audience.icon;
            return (
              <motion.div
                key={audience.key}
                className="h-full"
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              >
                <ContentCard className="flex flex-col gap-3">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <h3 className="font-heading text-lg font-semibold">
                    {t(`${audience.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(`${audience.key}.description`)}
                  </p>
                </ContentCard>
              </motion.div>
            );
          })}
        </ContentCardGrid>
      </div>
    </section>
  );
}
