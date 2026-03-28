"use client";

import { ChevronDown } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export function FaqSection() {
  const t = useTranslations("faq");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const items = t.raw("items") as { question: string; answer: string }[];

  return (
    <section className="py-28 md:py-36" ref={ref} aria-labelledby="faq-heading">
      <div className="mx-auto max-w-6xl px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("pretitle")}</p>
        <h2 id="faq-heading" className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl divide-y divide-border border-y border-border">
        {items.map((item, i) => (
          <motion.details
            key={i}
            className="group"
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.3,
              delay: i * 0.08,
              ease: "easeOut",
            }}
          >
            <summary className="flex cursor-pointer items-center justify-between py-5 text-left font-medium select-none">
              {item.question}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="pb-5 text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </motion.details>
        ))}
      </div>
      </div>
    </section>
  );
}
