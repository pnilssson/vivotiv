"use client";

import { useTranslations } from "next-intl";

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <span className="font-heading text-lg font-bold tracking-tight">
          Vivotiv
        </span>
        <a
          href="#scan"
          className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          {t("scanCta")}
        </a>
      </div>
    </header>
  );
}
