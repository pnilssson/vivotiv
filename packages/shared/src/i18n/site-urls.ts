import type { Locale } from "./locales";

export const publicSiteOrigin = "https://www.vivotiv.com";

export const publicBaseUrlByLocale: Record<Locale, string> = {
  en: publicSiteOrigin,
  sv: `${publicSiteOrigin}/sv`,
};

export function buildLocalizedSiteUrl(locale: Locale, path = ""): string {
  const normalizedPath = path.replace(/^\/+/, "");
  const suffix = normalizedPath ? `/${normalizedPath}` : "";

  return `${publicBaseUrlByLocale[locale]}${suffix}`;
}
