"use client";

import {
  Activity,
  Bot,
  FileSearch,
  Eye,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { ContentCard, ContentCardGrid } from "@/components/content-card";

const categories = [
  { key: "performance", icon: Activity },
  { key: "seo", icon: FileSearch },
  { key: "accessibility", icon: Eye },
  { key: "trustSecurity", icon: ShieldCheck },
  { key: "standards", icon: Globe },
  { key: "aiReadiness", icon: Bot },
] as const;

export function CategoriesSection() {
  const t = useTranslations("categories");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 md:py-32" ref={ref} aria-labelledby="categories-heading">
      <div className="mx-auto max-w-6xl px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("pretitle")}</p>
        <h2 id="categories-heading" className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ContentCardGrid className="mt-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, i) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.key}
              className="h-full"
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: i * 0.08,
                ease: "easeOut",
              }}
            >
              <ContentCard className="flex flex-col gap-3">
                <Icon className="h-5 w-5" aria-hidden="true" />
                <h3 className="font-heading text-sm font-semibold">
                  {t(`${category.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`${category.key}.description`)}
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
