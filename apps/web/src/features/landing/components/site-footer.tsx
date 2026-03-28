"use client";

import { useLocale, useTranslations } from "next-intl";

import { useCookieConsent } from "@/features/cookies/cookie-consent-provider";
import { Link, useRouter } from "@/i18n/navigation";
import type { Locale } from "@vivotiv/shared";

export function SiteFooter() {
  const t = useTranslations("footer");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { openPreferences } = useCookieConsent();
  const year = new Date().getFullYear();

  function switchLocale() {
    const next = locale === "sv" ? "en" : "sv";
    router.replace("/", { locale: next });
  }

  const linkClasses =
    "inline-flex min-h-6 min-w-6 items-center transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none";

  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>{t("copyright", { year })}</span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href="/privacy" className={linkClasses}>
          {t("privacy")}
        </Link>
        <Link href="/cookies" className={linkClasses}>
          {t("cookiePolicy")}
        </Link>
        <button
          type="button"
          onClick={openPreferences}
          className={`${linkClasses} cursor-pointer`}
        >
          {t("cookiePreferences")}
        </button>
        <button
          type="button"
          onClick={switchLocale}
          aria-label={t("switchLanguage")}
          className={`${linkClasses} cursor-pointer font-medium`}
        >
          {locale === "sv" ? "English" : "Svenska"}
        </button>
      </div>
    </footer>
  );
}
