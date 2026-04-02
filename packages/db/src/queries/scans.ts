import { eq, or, like } from "drizzle-orm";

import type { Database } from "../client";
import { scans } from "../schema";

type CreateScanInput = {
  leadId: string;
  url: string;
  overallScore: number | null;
  performanceScore: number | null;
  seoScore: number | null;
  accessibilityScore: number | null;
  legalScore: number | null;
  securityScore: number | null;
  standardsScore: number | null;
  source: string;
  details: unknown;
};

export async function createScan(db: Database, input: CreateScanInput) {
  const [scan] = await db
    .insert(scans)
    .values({
      leadId: input.leadId,
      url: input.url,
      overallScore: input.overallScore,
      performanceScore: input.performanceScore,
      seoScore: input.seoScore,
      accessibilityScore: input.accessibilityScore,
      legalScore: input.legalScore,
      securityScore: input.securityScore,
      standardsScore: input.standardsScore,
      source: input.source,
      details: input.details,
    })
    .returning({ id: scans.id });

  return scan;
}

export async function hasScanForDomain(db: Database, domain: string) {
  const [scan] = await db
    .select({ id: scans.id })
    .from(scans)
    .where(
      or(
        like(scans.url, `%://${domain}/%`),
        like(scans.url, `%://${domain}`),
        like(scans.url, `%://www.${domain}/%`),
        like(scans.url, `%://www.${domain}`),
      ),
    )
    .limit(1);

  return !!scan;
}

export async function getScanById(db: Database, id: string) {
  const [scan] = await db.select().from(scans).where(eq(scans.id, id));

  return scan ?? null;
}
