import { defineRouting } from "next-intl/routing";

import { locales } from "@vivotiv/shared";

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  domains: [
    {
      domain: "vivotiv.com",
      defaultLocale: "en",
      locales: ["en"],
    },
    {
      domain: "vivotiv.se",
      defaultLocale: "sv",
      locales: ["sv"],
    },
  ],
});
