import { render } from "@react-email/components";
import type { ScanCategoryKey, ScanDetailsV1 } from "@vivotiv/shared";
import { scanCategoryKeys } from "@vivotiv/shared";
import type { Locale } from "@vivotiv/shared";

import { env } from "../env";
import { transporter } from "./client";
import { ScanCompleteEmail } from "./templates/scan-complete";

const domainByLocale: Record<Locale, string> = {
  en: "https://vivotiv.com",
  sv: "https://vivotiv.se",
};

function buildResultsUrl(scanId: string, locale: Locale): string {
  const base = domainByLocale[locale];
  return `${base}/${locale}/scan/${scanId}`;
}

type SendScanCompleteEmailInput = {
  to: string;
  scanId: string;
  url: string;
  locale: Locale;
  overallScore: number;
  details: ScanDetailsV1;
};

export async function sendScanCompleteEmail(
  input: SendScanCompleteEmailInput,
): Promise<void> {
  const categoryScores: { key: ScanCategoryKey; score: number | null }[] =
    scanCategoryKeys.map((key) => ({
      key,
      score: input.details[key]?.score ?? null,
    }));

  const resultsUrl = buildResultsUrl(input.scanId, input.locale);

  const html = await render(
    ScanCompleteEmail({
      url: input.url,
      overallScore: input.overallScore,
      categoryScores,
      resultsUrl,
    }),
  );

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject: `Your website scored ${input.overallScore}/100`,
    html,
  });
}
