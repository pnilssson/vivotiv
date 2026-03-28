"use client";

import {
  Activity,
  FileSearch,
  Eye,
  Scale,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

const categories = [
  { key: "performance", icon: Activity },
  { key: "seo", icon: FileSearch },
  { key: "accessibility", icon: Eye },
  { key: "legal", icon: Scale },
  { key: "security", icon: ShieldCheck },
  { key: "standards", icon: Globe },
] as const;

export function CategoriesSection() {
  const t = useTranslations("categories");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 md:py-36" ref={ref} aria-labelledby="categories-heading">
      <div className="mx-auto max-w-6xl px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("pretitle")}</p>
        <h2 id="categories-heading" className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, i) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.key}
              className="flex flex-col gap-3 bg-card p-8 transition-colors hover:bg-depth-1"
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: i * 0.08,
                ease: "easeOut",
              }}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-heading text-sm font-semibold">
                {t(`${category.key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`${category.key}.description`)}
              </p>
            </motion.div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
