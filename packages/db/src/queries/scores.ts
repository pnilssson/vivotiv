import { avg, count } from "drizzle-orm";

import type { Database } from "../client";
import { scans } from "../schema";

export async function getAverageScores(db: Database) {
  const [result] = await db
    .select({
      performance: avg(scans.performanceScore),
      seo: avg(scans.seoScore),
      accessibility: avg(scans.accessibilityScore),
      legal: avg(scans.legalScore),
      security: avg(scans.securityScore),
      standards: avg(scans.standardsScore),
      scanCount: count(),
    })
    .from(scans);

  return {
    performance: Math.round(Number(result.performance ?? 0)),
    seo: Math.round(Number(result.seo ?? 0)),
    accessibility: Math.round(Number(result.accessibility ?? 0)),
    legal: Math.round(Number(result.legal ?? 0)),
    security: Math.round(Number(result.security ?? 0)),
    standards: Math.round(Number(result.standards ?? 0)),
    scanCount: result.scanCount,
  };
}
