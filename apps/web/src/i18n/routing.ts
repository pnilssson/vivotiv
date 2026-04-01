import { defineRouting } from "next-intl/routing";

import { locales } from "@vivotiv/shared";

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  domains: [
    {
      domain: "www.vivotiv.com",
      defaultLocale: "en",
      locales: ["en"],
    },
    {
      domain: "www.vivotiv.se",
      defaultLocale: "sv",
      locales: ["sv"],
    },
  ],
});
