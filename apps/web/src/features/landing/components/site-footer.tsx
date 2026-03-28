"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@vivotiv/shared";

export function SiteFooter() {
  const t = useTranslations("footer");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const year = new Date().getFullYear();

  function switchLocale() {
    const next = locale === "sv" ? "en" : "sv";
    router.replace("/", { locale: next });
  }

  return (
    <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
      <span>{t("copyright", { year })}</span>
      <div className="flex items-center gap-4">
        <a href="/privacy" className="hover:text-foreground transition-colors">
          {t("privacy")}
        </a>
        <button
          type="button"
          onClick={switchLocale}
          className="cursor-pointer font-medium transition-colors hover:text-foreground"
        >
          {locale === "sv" ? "English" : "Svenska"}
        </button>
      </div>
    </footer>
  );
}
