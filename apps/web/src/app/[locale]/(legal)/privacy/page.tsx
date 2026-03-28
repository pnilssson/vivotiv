import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Privacy Policy | Vivotiv",
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacy");

  return (
    <>
      <h1>{t("title")}</h1>
      <p>
        <strong>{t("lastUpdated")}</strong>
      </p>

      <p>{t("intro")}</p>

      <h2>{t("controller.title")}</h2>
      <p>
        {t("controller.name")}
        <br />
        {t("controller.email.label")}:{" "}
        <a href={`mailto:${t("controller.email.address")}`}>
          {t("controller.email.address")}
        </a>
      </p>
      <p>{t("controller.contact")}</p>

      <h2>{t("dataCollected.title")}</h2>

      <h3>{t("dataCollected.leadData.title")}</h3>
      <p>{t("dataCollected.leadData.description")}</p>

      <h2>{t("legalBasis.title")}</h2>
      <table>
        <thead>
          <tr>
            <th>{t("legalBasis.table.purpose")}</th>
            <th>{t("legalBasis.table.basis")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{t("legalBasis.table.scan.purpose")}</td>
            <td>{t("legalBasis.table.scan.basis")}</td>
          </tr>
          <tr>
            <td>{t("legalBasis.table.email.purpose")}</td>
            <td>{t("legalBasis.table.email.basis")}</td>
          </tr>
        </tbody>
      </table>

      <h2>{t("processors.title")}</h2>
      <p>{t("processors.intro")}</p>
      <table>
        <thead>
          <tr>
            <th>{t("processors.table.processor")}</th>
            <th>{t("processors.table.purpose")}</th>
            <th>{t("processors.table.location")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase</td>
            <td>{t("processors.supabase")}</td>
            <td>EU (AWS eu-west-1)</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>{t("processors.vercel")}</td>
            <td>US / EU</td>
          </tr>
          <tr>
            <td>one.com</td>
            <td>{t("processors.onecom")}</td>
            <td>EU</td>
          </tr>
        </tbody>
      </table>

      <h2>{t("transfers.title")}</h2>
      <p>{t("transfers.description")}</p>

      <h2>{t("retention.title")}</h2>
      <table>
        <thead>
          <tr>
            <th>{t("retention.table.data")}</th>
            <th>{t("retention.table.period")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{t("retention.table.leads.data")}</td>
            <td>{t("retention.table.leads.period")}</td>
          </tr>
        </tbody>
      </table>

      <h2>{t("rights.title")}</h2>
      <p>{t("rights.intro")}</p>
      <ul>
        <li>
          <strong>{t("rights.access.title")}</strong> {t("rights.access.description")}
        </li>
        <li>
          <strong>{t("rights.rectification.title")}</strong> {t("rights.rectification.description")}
        </li>
        <li>
          <strong>{t("rights.erasure.title")}</strong> {t("rights.erasure.description")}
        </li>
        <li>
          <strong>{t("rights.restriction.title")}</strong> {t("rights.restriction.description")}
        </li>
        <li>
          <strong>{t("rights.portability.title")}</strong> {t("rights.portability.description")}
        </li>
        <li>
          <strong>{t("rights.object.title")}</strong> {t("rights.object.description")}
        </li>
        <li>
          <strong>{t("rights.withdraw.title")}</strong> {t("rights.withdraw.description")}
        </li>
      </ul>
      <p>
        {t("rights.exercise")}{" "}
        <a href={`mailto:${t("controller.email.address")}`}>
          {t("controller.email.address")}
        </a>
        . {t("rights.responseTime")}
      </p>

      <h2>{t("authority.title")}</h2>
      <p>
        {t("authority.description")}{" "}
        <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer">
          imy.se
        </a>
        .
      </p>

      <h2>{t("changes.title")}</h2>
      <p>{t("changes.description")}</p>

      <h2>{t("contact.title")}</h2>
      <p>
        <a href={`mailto:${t("controller.email.address")}`}>
          {t("controller.email.address")}
        </a>
      </p>
    </>
  );
}
