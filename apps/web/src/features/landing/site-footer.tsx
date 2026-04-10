"use client";

import { GlobeIcon } from "lucide-react";
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
  const guidesHref = locale === "sv" ? "/guider" : "/guides";

  function switchLocale() {
    const next = locale === "sv" ? "en" : "sv";
    router.replace("/", { locale: next });
  }

  const linkClasses =
    "text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none";

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-4">
          <span className="font-heading text-lg font-bold tracking-tight">
            Vivotiv
          </span>
          <span className="text-sm text-muted-foreground">
            {t("tagline")}
          </span>
          <button
            type="button"
            onClick={switchLocale}
            aria-label={t("switchLanguage")}
            className={`${linkClasses} inline-flex w-fit cursor-pointer items-center gap-1.5 text-left`}
          >
            <GlobeIcon className="size-3.5" />
            {locale === "sv" ? "English" : "Svenska"}
          </button>
          <span className="text-sm text-muted-foreground">
            {t("copyright", { year })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{t("columnResources")}</span>
            <Link href="/how-scan-works" className={linkClasses}>
              {t("howScanWorks")}
            </Link>
            <Link href={guidesHref} className={linkClasses}>
              {t("guides")}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{t("columnCompliance")}</span>
            <Link href="/accessibility" className={linkClasses}>
              {t("accessibility")}
            </Link>
            <Link href="/privacy-compliance" className={linkClasses}>
              {t("privacyCompliance")}
            </Link>
            <Link href="/cookie-consent-requirements" className={linkClasses}>
              {t("cookieConsent")}
            </Link>
            <Link href="/website-security-basics" className={linkClasses}>
              {t("websiteSecurity")}
            </Link>
            <Link href="/website-compliance-checklist" className={linkClasses}>
              {t("complianceChecklist")}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{t("columnActions")}</span>
            <Link href="/free-website-test" className={linkClasses}>
              {t("freeWebsiteTest")}
            </Link>
            <Link href="/website-health-check" className={linkClasses}>
              {t("websiteHealthCheck")}
            </Link>
            <Link href="/slow-website" className={linkClasses}>
              {t("slowWebsite")}
            </Link>
            <Link href="/website-not-secure" className={linkClasses}>
              {t("websiteNotSecure")}
            </Link>
            <Link href="/website-not-ranking" className={linkClasses}>
              {t("websiteNotRanking")}
            </Link>
          </div>

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
        </div>
      </div>
    </footer>
  );
}
