import { createDb, createScan } from "@vivotiv/db";
import type { ScanDetailsV1 } from "@vivotiv/shared";

import { env } from "../env";

interface StoreScanInput {
  leadId: string;
  url: string;
  overallScore: number;
  details: ScanDetailsV1;
}

export async function storeScanResult(input: StoreScanInput) {
  const db = createDb(env.DATABASE_URL);

  return await createScan(db, {
    leadId: input.leadId,
    url: input.url,
    overallScore: input.overallScore,
    performanceScore: input.details.performance?.score ?? null,
    seoScore: input.details.seo?.score ?? null,
    accessibilityScore: input.details.accessibility?.score ?? null,
    legalScore: input.details.legal?.score ?? null,
    securityScore: input.details.security?.score ?? null,
    standardsScore: input.details.standards?.score ?? null,
    details: input.details,
  });
}
