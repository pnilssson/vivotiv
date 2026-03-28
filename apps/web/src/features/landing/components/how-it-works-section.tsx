"use client";

import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

const steps = ["step1", "step2", "step3"] as const;

export function HowItWorksSection() {
  const t = useTranslations("howItWorks");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 md:py-36" ref={ref} aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("pretitle")}</p>
          <h2 id="how-it-works-heading" className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Mobile: left-aligned timeline */}
        <div className="mx-auto mt-16 max-w-lg md:hidden">
          <div className="relative pl-12">
            <div className="absolute left-[1.0625rem] top-2 bottom-2 w-px bg-border" />
            <div className="flex flex-col gap-16">
              {steps.map((step, i) => (
                <motion.div
                  key={step}
                  className="relative"
                  initial={{ opacity: 0, x: -12 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.15, ease: "easeOut" }}
                >
                  <div className="absolute -left-12 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-depth-1 text-xs font-semibold tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      {t(`${step}.title`)}
                    </h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">
                      {t(`${step}.description`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: alternating left/right timeline */}
        <div className="relative mx-auto mt-16 hidden max-w-2xl md:block">
          <div className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-border" />
          <div className="flex flex-col gap-20">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={step}
                  className="relative flex items-start"
                  initial={{ opacity: 0, x: isLeft ? -16 : 16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.15, ease: "easeOut" }}
                >
                  {/* Step number centered on the line */}
                  <div className="absolute left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-depth-1 text-xs font-semibold tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {isLeft ? (
                    <>
                      <div className="w-1/2 pr-12 text-right">
                        <h3 className="font-heading text-lg font-semibold">
                          {t(`${step}.title`)}
                        </h3>
                        <p className="mt-2 text-muted-foreground leading-relaxed">
                          {t(`${step}.description`)}
                        </p>
                      </div>
                      <div className="w-1/2" />
                    </>
                  ) : (
                    <>
                      <div className="w-1/2" />
                      <div className="w-1/2 pl-12">
                        <h3 className="font-heading text-lg font-semibold">
                          {t(`${step}.title`)}
                        </h3>
                        <p className="mt-2 text-muted-foreground leading-relaxed">
                          {t(`${step}.description`)}
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
