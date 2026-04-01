import { readFile, readdir } from "fs/promises";
import path from "path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { locales, type Locale } from "@vivotiv/shared";

import { ScanCta } from "@/features/content/scan-cta";
import { domainsByLocale } from "./site-domains";

const mdxComponents = {
  ScanCta,
};

export type ContentFamily =
  | "compliance"
  | "actions"
  | "cms"
  | "checks"
  | "comparisons"
  | "standalone";

export type ContentFrontmatter = {
  title: string;
  description: string;
  lastUpdated: string;
  family?: ContentFamily;
  relatedChecks?: string[];
  relatedSlugs?: string[];
  noindex?: boolean;
  localeSlug?: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "pages");

export async function getContentPage(directorySlug: string, locale: string) {
  const filePath = path.join(CONTENT_DIR, directorySlug, `${locale}.mdx`);
  const source = await readFile(filePath, "utf-8");

  const { content, frontmatter } = await compileMDX<ContentFrontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return { content, frontmatter };
}

export async function getFrontmatter(
  directorySlug: string,
  locale: string,
): Promise<ContentFrontmatter> {
  const filePath = path.join(CONTENT_DIR, directorySlug, `${locale}.mdx`);
  const source = await readFile(filePath, "utf-8");
  const { data } = matter(source);
  return data as ContentFrontmatter;
}

export async function getAllContentSlugs() {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

/**
 * Builds a map from localeSlug to directorySlug for a given locale.
 * Only includes entries where a localeSlug is defined in frontmatter.
 */
export async function getSlugMapping(
  locale: Locale,
): Promise<Map<string, string>> {
  const slugs = await getAllContentSlugs();
  const mapping = new Map<string, string>();

  for (const dirSlug of slugs) {
    try {
      const fm = await getFrontmatter(dirSlug, locale);
      if (fm.localeSlug) {
        mapping.set(fm.localeSlug, dirSlug);
      }
    } catch {
      // Locale file doesn't exist for this slug, skip
    }
  }

  return mapping;
}

/**
 * Resolves any slug (directory name or localeSlug) to its directory name.
 * Returns null if the slug doesn't match any content page.
 */
export async function resolveSlug(
  slug: string,
  locale: Locale,
): Promise<string | null> {
  const allSlugs = await getAllContentSlugs();

  // Direct directory match
  if (allSlugs.includes(slug)) {
    return slug;
  }

  // Check if it's a locale-specific slug
  const mapping = await getSlugMapping(locale);
  return mapping.get(slug) ?? null;
}

/**
 * Returns the locale-specific slug for a directory, or the directory name if none exists.
 */
export async function getLocaleSlug(
  directorySlug: string,
  locale: Locale,
): Promise<string> {
  try {
    const fm = await getFrontmatter(directorySlug, locale);
    return fm.localeSlug ?? directorySlug;
  } catch {
    return directorySlug;
  }
}

/**
 * Returns all content pages with their frontmatter for a given locale.
 * Useful for the guides hub and sitemap generation.
 */
export async function getAllContentPages(locale: Locale) {
  const slugs = await getAllContentSlugs();
  const pages: Array<{ directorySlug: string; frontmatter: ContentFrontmatter }> = [];

  for (const dirSlug of slugs) {
    try {
      const frontmatter = await getFrontmatter(dirSlug, locale);
      pages.push({ directorySlug: dirSlug, frontmatter });
    } catch {
      // Locale file doesn't exist, skip
    }
  }

  return pages;
}

export { locales };
export { domainsByLocale };
