import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://vivotiv.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          sv: "https://vivotiv.se",
        },
      },
    },
    {
      url: "https://vivotiv.se",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: "https://vivotiv.com",
        },
      },
    },
  ];
}
