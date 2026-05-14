import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContentCard, ContentCardGrid } from "@/components/content-card";
import { SectionDivider } from "@/features/landing/section-divider";
import { SiteFooter } from "@/features/landing/site-footer";
import { SiteHeader } from "@/features/landing/site-header";
import { Link } from "@/i18n/navigation";

import {
  buildLocalizedSiteUrl,
  publicSiteOrigin,
  type Locale,
} from "@vivotiv/shared";

import {
  getAllContentPages,
  getLocaleSlug,
  type ContentFamily,
} from "@/lib/content";

type GuidesPageProps = {
  params: Promise<{ locale: string }>;
};

const familyOrder: ContentFamily[] = [
  "compliance",
  "actions",
  "cms",
  "checks",
  "comparisons",
  "standalone",
];

function getGuidesPath(locale: string) {
  return locale === "sv" ? "/guider" : "/guides";
}

export async function generateMetadata({
  params,
}: GuidesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides" });
  const typedLocale = locale as Locale;
  const guidesPath = getGuidesPath(locale);
  const url = buildLocalizedSiteUrl(typedLocale, guidesPath);

  return {
    metadataBase: new URL(publicSiteOrigin),
    title: `${t("title")} | Vivotiv`,
    description: t("description"),
    alternates: {
      canonical: url,
      languages: {
        en: buildLocalizedSiteUrl("en", "guides"),
        sv: buildLocalizedSiteUrl("sv", "guider"),
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url,
      siteName: "Vivotiv",
      locale: locale === "sv" ? "sv_SE" : "en_US",
      type: "website",
    },
  };
}

export default async function GuidesPage({ params }: GuidesPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(locale);

  const t = await getTranslations("guides");
  const pages = await getAllContentPages(typedLocale);

  const grouped = new Map<ContentFamily, typeof pages>();
  for (const page of pages) {
    if (page.frontmatter.noindex) continue;
    const family = page.frontmatter.family ?? "standalone";
    const existing = grouped.get(family) ?? [];
    existing.push(page);
    grouped.set(family, existing);
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="min-h-screen bg-background">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("pretitle")}
              </p>
              <h1 className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("description")}
              </p>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            {familyOrder.map((family) => {
              const familyPages = grouped.get(family);
              if (!familyPages?.length) return null;

              return (
                <div key={family} className="mb-16 last:mb-0">
                  <h2 className="font-heading text-xl font-semibold tracking-tight">
                    {t(`families.${family}`)}
                  </h2>
                  <ContentCardGrid className="mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {familyPages.map(
                      async ({ directorySlug, frontmatter }) => {
                        const slug = await getLocaleSlug(
                          directorySlug,
                          typedLocale,
                        );
                        return (
                          <Link
                            key={directorySlug}
                            href={`/${slug}`}
                            className="block h-full no-underline"
                          >
                            <ContentCard className="flex h-full flex-col gap-3">
                              <h3 className="font-heading text-sm font-semibold">
                                {frontmatter.title}
                              </h3>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {frontmatter.description}
                              </p>
                            </ContentCard>
                          </Link>
                        );
                      },
                    )}
                  </ContentCardGrid>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
