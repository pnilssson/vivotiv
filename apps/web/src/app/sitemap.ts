import type { MetadataRoute } from "next";

import {
  getAllContentPages,
  getLocaleSlug,
  locales,
} from "@/lib/content";
import { buildLocalizedSiteUrl, publicBaseUrlByLocale } from "@vivotiv/shared";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: publicBaseUrlByLocale.en,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          sv: publicBaseUrlByLocale.sv,
        },
      },
    },
    {
      url: publicBaseUrlByLocale.sv,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: publicBaseUrlByLocale.en,
        },
      },
    },
  ];

  // Add content pages
  const enPages = await getAllContentPages("en");

  for (const { directorySlug, frontmatter } of enPages) {
    if (frontmatter.noindex) continue;

    const languages: Record<string, string> = {};
    for (const loc of locales) {
      const slug = await getLocaleSlug(directorySlug, loc);
      languages[loc] = buildLocalizedSiteUrl(loc, slug);
    }

    entries.push({
      url: buildLocalizedSiteUrl("en", directorySlug),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages },
    });
  }

  // Add guides hub
  entries.push({
    url: buildLocalizedSiteUrl("en", "guides"),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: {
        en: buildLocalizedSiteUrl("en", "guides"),
        sv: buildLocalizedSiteUrl("sv", "guider"),
      },
    },
  });

  return entries;
}
