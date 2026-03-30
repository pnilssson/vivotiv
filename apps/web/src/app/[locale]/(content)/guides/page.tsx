import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import type { Locale } from "@vivotiv/shared";

import {
  domainsByLocale,
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

export async function generateMetadata({
  params,
}: GuidesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides" });
  const domain = domainsByLocale[locale as Locale];

  return {
    title: `${t("title")} | Vivotiv`,
    description: t("description"),
    alternates: {
      canonical: `${domain}/guides`,
      languages: {
        en: `${domainsByLocale.en}/guides`,
        sv: `${domainsByLocale.sv}/guides`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${domain}/guides`,
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

  // Group pages by family, excluding noindex
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
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>

      {familyOrder.map((family) => {
        const familyPages = grouped.get(family);
        if (!familyPages?.length) return null;

        return (
          <section key={family} className="mt-10">
            <h2>{t(`families.${family}`)}</h2>
            <ul>
              {familyPages.map(async ({ directorySlug, frontmatter }) => {
                const slug = await getLocaleSlug(directorySlug, typedLocale);
                return (
                  <li key={directorySlug}>
                    <Link href={`/${slug}`}>{frontmatter.title}</Link>
                    {" - "}
                    <span>{frontmatter.description}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
