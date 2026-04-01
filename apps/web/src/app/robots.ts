import type { MetadataRoute } from "next";

import { domainsByLocale } from "@/lib/site-domains";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: [
      `${domainsByLocale.en}/sitemap.xml`,
      `${domainsByLocale.sv}/sitemap.xml`,
    ],
  };
}
