import { PostHogProvider, PostHogPageView } from "@posthog/next";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import {
  publicBaseUrlByLocale,
  publicSiteOrigin,
  type Locale,
} from "@vivotiv/shared";

import { PostHogConsentBridge } from "@/features/analytics/posthog-consent-bridge";
import { CookieBanner } from "@/features/cookies/cookie-banner";
import { CookieConsentProvider } from "@/features/cookies/cookie-consent-provider";
import { routing } from "@/i18n/routing";
import { MotionProvider } from "@/providers/motion-provider";
import { AppQueryClientProvider } from "@/providers/query-client-provider";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const domain = publicBaseUrlByLocale[typedLocale];
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(publicSiteOrigin),
    title,
    description,
    verification: {
      google: "4rwJVIcDIIijcKuTBW46S-nSPbmqO7Mjc0Ve_uf4Gc8",
    },
    alternates: {
      canonical: domain,
      languages: {
        en: publicBaseUrlByLocale.en,
        sv: publicBaseUrlByLocale.sv,
      },
    },
    openGraph: {
      title,
      description,
      url: domain,
      siteName: "Vivotiv",
      locale: locale === "sv" ? "sv_SE" : "en_US",
      type: "website",
      images: [
        {
          url: `${publicSiteOrigin}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Vivotiv - Free website scan",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${publicSiteOrigin}/opengraph-image`],
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
      <NuqsAdapter>
        <MotionProvider>
          <PostHogProvider
            clientOptions={{
              api_host: "/ingest",
              opt_out_capturing_by_default: true,
              capture_pageview: false,
            }}
          >
            <CookieConsentProvider>
              <PostHogConsentBridge />
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              <AppQueryClientProvider>{children}</AppQueryClientProvider>
              <CookieBanner />
            </CookieConsentProvider>
          </PostHogProvider>
        </MotionProvider>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
}
