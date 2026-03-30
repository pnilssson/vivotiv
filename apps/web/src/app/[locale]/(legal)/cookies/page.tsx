import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Cookie Policy | Vivotiv",
  robots: { index: false },
};

export default function CookiePolicyPage() {
  const t = useTranslations("cookiePolicy");

  return (
    <>
      <h1>{t("title")}</h1>
      <p>
        <strong>{t("lastUpdated")}</strong>
      </p>

      <p>{t("intro")}</p>

      <h2>{t("whatAreCookies.title")}</h2>
      <p>{t("whatAreCookies.description")}</p>

      <h2>{t("cookiesWeUse.title")}</h2>

      <h3>{t("cookiesWeUse.necessary.title")}</h3>
      <p>{t("cookiesWeUse.necessary.description")}</p>
      <table>
        <thead>
          <tr>
            <th>{t("cookiesWeUse.table.cookie")}</th>
            <th>{t("cookiesWeUse.table.purpose")}</th>
            <th>{t("cookiesWeUse.table.duration")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>NEXT_LOCALE</code>
            </td>
            <td>{t("cookiesWeUse.necessary.locale.purpose")}</td>
            <td>{t("cookiesWeUse.necessary.locale.duration")}</td>
          </tr>
          <tr>
            <td>
              <code>vivotiv-cookie-consent</code>
            </td>
            <td>{t("cookiesWeUse.necessary.consent.purpose")}</td>
            <td>{t("cookiesWeUse.necessary.consent.duration")}</td>
          </tr>
        </tbody>
      </table>

      <h3>{t("cookiesWeUse.analytics.title")}</h3>
      <p>{t("cookiesWeUse.analytics.description")}</p>
      <table>
        <thead>
          <tr>
            <th>{t("cookiesWeUse.table.cookie")}</th>
            <th>{t("cookiesWeUse.table.purpose")}</th>
            <th>{t("cookiesWeUse.table.duration")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>ph_*_posthog</code>
            </td>
            <td>{t("cookiesWeUse.analytics.posthog.purpose")}</td>
            <td>{t("cookiesWeUse.analytics.posthog.duration")}</td>
          </tr>
        </tbody>
      </table>

      <h2>{t("managing.title")}</h2>
      <p>{t("managing.description")}</p>
      <ul>
        <li>{t("managing.preferences")}</li>
        <li>{t("managing.browser")}</li>
      </ul>

      <h2>{t("contact.title")}</h2>
      <p>
        {t("contact.description")}{" "}
        <a href="mailto:hello@vivotiv.com">hello@vivotiv.com</a>.
      </p>
    </>
  );
}
