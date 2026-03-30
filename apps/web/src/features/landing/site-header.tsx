"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-heading text-lg font-bold tracking-tight">
          Vivotiv
        </Link>
        <nav aria-label={t("primaryNav")}>
          <a
            href="#scan"
            className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("scanCta")}
          </a>
        </nav>
      </div>
    </header>
  );
}
