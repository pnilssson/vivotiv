import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: [
      "https://vivotiv.com/sitemap.xml",
      "https://vivotiv.se/sitemap.xml",
    ],
  };
}
