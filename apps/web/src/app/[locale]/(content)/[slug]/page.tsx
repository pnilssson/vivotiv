import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import type { Locale } from "@vivotiv/shared";

import { Breadcrumbs } from "@/features/content/breadcrumbs";
import {
  domainsByLocale,
  getAllContentPages,
  getContentPage,
  getLocaleSlug,
  locales,
  resolveSlug,
} from "@/lib/content";

type ContentPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const pages = await getAllContentPages(locale as Locale);

  return pages.map(({ directorySlug, frontmatter }) => ({
    slug: frontmatter.localeSlug ?? directorySlug,
  }));
}

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;

  const directorySlug = await resolveSlug(slug, typedLocale);
  if (!directorySlug) return {};

  try {
    const { frontmatter } = await getContentPage(directorySlug, locale);
    const domain = domainsByLocale[typedLocale];
    const currentSlug = frontmatter.localeSlug ?? directorySlug;

    // Build hreflang alternates
    const languages: Record<string, string> = {};
    for (const loc of locales) {
      const locDomain = domainsByLocale[loc];
      const locSlug = await getLocaleSlug(directorySlug, loc);
      languages[loc] = `${locDomain}/${locSlug}`;
    }

    return {
      title: `${frontmatter.title} | Vivotiv`,
      description: frontmatter.description,
      alternates: {
        canonical: `${domain}/${currentSlug}`,
        languages,
      },
      openGraph: {
        title: frontmatter.title,
        description: frontmatter.description,
        url: `${domain}/${currentSlug}`,
        siteName: "Vivotiv",
        locale: locale === "sv" ? "sv_SE" : "en_US",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: frontmatter.title,
        description: frontmatter.description,
      },
      robots: frontmatter.noindex
        ? { index: false, follow: false }
        : { index: true, follow: true },
    };
  } catch {
    return {};
  }
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(locale);

  const directorySlug = await resolveSlug(slug, typedLocale);
  if (!directorySlug) {
    notFound();
  }

  // If the user hit the directory slug but a localeSlug exists, redirect
  const localeSlug = await getLocaleSlug(directorySlug, typedLocale);
  if (localeSlug !== directorySlug && slug === directorySlug) {
    redirect(`/${localeSlug}`);
  }

  const { content, frontmatter } = await getContentPage(directorySlug, locale);

  const domain = domainsByLocale[typedLocale];
  const currentSlug = frontmatter.localeSlug ?? directorySlug;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description: frontmatter.description,
    inLanguage: locale === "sv" ? "sv-SE" : "en-US",
    url: `${domain}/${currentSlug}`,
    publisher: {
      "@type": "Organization",
      name: "Vivotiv",
      url: domain,
    },
  };

  // Build breadcrumb based on family
  const isStandalone = !frontmatter.family || frontmatter.family === "standalone";
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: domain },
    ...(!isStandalone
      ? [
          {
            "@type": "ListItem",
            position: 2,
            name: locale === "sv" ? "Guider" : "Guides",
            item: `${domain}/guides`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: frontmatter.title,
          },
        ]
      : [{ "@type": "ListItem", position: 2, name: frontmatter.title }]),
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Breadcrumbs family={frontmatter.family} title={frontmatter.title} />
      <h1>{frontmatter.title}</h1>
      <p>
        <strong>{frontmatter.lastUpdated}</strong>
      </p>
      {content}
    </>
  );
}
