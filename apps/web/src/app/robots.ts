import type { MetadataRoute } from "next";

import { publicSiteOrigin } from "@vivotiv/shared";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${publicSiteOrigin}/sitemap.xml`,
  };
}
