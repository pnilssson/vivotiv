import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { getAllContentSlugs, getContentPage } from "@/lib/content";

type ContentPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllContentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const { frontmatter } = await getContentPage(slug, locale);
    return {
      title: `${frontmatter.title} | Vivotiv`,
      description: frontmatter.description,
    };
  } catch {
    return {};
  }
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  const slugs = await getAllContentSlugs();
  if (!slugs.includes(slug)) {
    notFound();
  }

  const { content, frontmatter } = await getContentPage(slug, locale);

  return (
    <>
      <h1>{frontmatter.title}</h1>
      <p>
        <strong>{frontmatter.lastUpdated}</strong>
      </p>
      {content}
    </>
  );
}
