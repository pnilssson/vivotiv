import { defineRouting } from "next-intl/routing";

import { locales } from "@vivotiv/shared";

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});
