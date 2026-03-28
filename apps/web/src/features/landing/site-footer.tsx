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
    "text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none";

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-32 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-4">
          <span className="font-heading text-lg font-bold tracking-tight">
            Vivotiv
          </span>
          <span className="text-sm text-muted-foreground">
            {t("copyright", { year })}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-24 gap-y-8 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{t("columnLegal")}</span>
            <Link href="/privacy" className={linkClasses}>
              {t("privacy")}
            </Link>
            <Link href="/cookies" className={linkClasses}>
              {t("cookiePolicy")}
            </Link>
            <button
              type="button"
              onClick={openPreferences}
              className={`${linkClasses} cursor-pointer text-left`}
            >
              {t("cookiePreferences")}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{t("columnLanguage")}</span>
            <button
              type="button"
              onClick={switchLocale}
              aria-label={t("switchLanguage")}
              className={`${linkClasses} cursor-pointer text-left`}
            >
              {locale === "sv" ? "English" : "Svenska"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
