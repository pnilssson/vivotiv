"use client";

import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { ContentCard, ContentCardGrid } from "@/components/content-card";
import { Link } from "@/i18n/navigation";

const topics = [
  {
    key: "accessibility",
    href: "/accessibility",
    stats: ["stat1", "stat2"] as const,
  },
  {
    key: "privacy",
    href: "/privacy-compliance",
    stats: ["stat1", "stat2"] as const,
  },
] as const;

export function LegalComplianceSection() {
  const t = useTranslations("legalCompliance");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 md:py-32" ref={ref} aria-labelledby="legal-compliance-heading">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("pretitle")}</p>
          <h2 id="legal-compliance-heading" className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
          {topics.map((topic, topicIdx) => (
            <motion.div
              key={topic.key}
              className="flex flex-col"
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: topicIdx * 0.15, ease: "easeOut" }}
            >
              <h3 className="font-heading text-xl font-bold tracking-tight">
                {t(`${topic.key}.title`)}
              </h3>
              <p className="mt-3 flex-1 text-muted-foreground leading-relaxed">
                {t(`${topic.key}.description`)}
              </p>

              <ContentCardGrid className="mt-6 flex-col">
                {topic.stats.map((stat, i) => (
                  <motion.div
                    key={stat}
                    initial={{ opacity: 0, y: 8 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: 0.2 + topicIdx * 0.15 + i * 0.1,
                      ease: "easeOut",
                    }}
                  >
                    <ContentCard>
                      <div className="font-heading text-2xl font-bold tracking-tight">
                        {t(`${topic.key}.${stat}.value`)}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(`${topic.key}.${stat}.label`)}
                      </p>
                    </ContentCard>
                  </motion.div>
                ))}
              </ContentCardGrid>

              <div className="mt-6">
                <Button variant="outline" nativeButton={false} className="border-brand text-brand hover:bg-brand/10 hover:text-brand" render={<Link href={topic.href} />}>
                  {t(`${topic.key}.cta`)}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
