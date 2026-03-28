import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CookieBanner } from "@/features/cookies/cookie-banner";
import { CookieConsentProvider } from "@/features/cookies/cookie-consent-provider";
import { routing } from "@/i18n/routing";
import { MotionProvider } from "@/providers/motion-provider";
import { AppQueryClientProvider } from "@/providers/query-client-provider";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const domainsByLocale = {
  en: "https://vivotiv.com",
  sv: "https://vivotiv.se",
} as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const domain = domainsByLocale[locale as keyof typeof domainsByLocale];
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    alternates: {
      canonical: domain,
      languages: {
        en: domainsByLocale.en,
        sv: domainsByLocale.sv,
      },
    },
    openGraph: {
      title,
      description,
      url: domain,
      siteName: "Vivotiv",
      locale: locale === "sv" ? "sv_SE" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <MotionProvider>
        <CookieConsentProvider>
          <AppQueryClientProvider>{children}</AppQueryClientProvider>
          <CookieBanner />
        </CookieConsentProvider>
      </MotionProvider>
    </NextIntlClientProvider>
  );
}
