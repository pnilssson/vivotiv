import type { MetadataRoute } from "next";

import {
  getAllContentPages,
  getLocaleSlug,
  locales,
} from "@/lib/content";
import { domainsByLocale } from "@/lib/site-domains";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: domainsByLocale.en,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          sv: domainsByLocale.sv,
        },
      },
    },
    {
      url: domainsByLocale.sv,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: domainsByLocale.en,
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
      const domain = domainsByLocale[loc];
      const slug = await getLocaleSlug(directorySlug, loc);
      languages[loc] = `${domain}/${slug}`;
    }

    entries.push({
      url: `${domainsByLocale.en}/${directorySlug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages },
    });
  }

  // Add guides hub
  entries.push({
    url: `${domainsByLocale.en}/guides`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: {
        en: `${domainsByLocale.en}/guides`,
        sv: `${domainsByLocale.sv}/guider`,
      },
    },
  });

  return entries;
}
