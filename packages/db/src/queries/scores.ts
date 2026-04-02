import { avg, count } from "drizzle-orm";

import type { Database } from "../client";
import { scans } from "../schema";

export async function getAverageScores(db: Database) {
  const [result] = await db
    .select({
      performance: avg(scans.performanceScore),
      seo: avg(scans.seoScore),
      accessibility: avg(scans.accessibilityScore),
      trustSecurity: avg(scans.trustSecurityScore),
      standards: avg(scans.standardsScore),
      aiReadiness: avg(scans.aiReadinessScore),
      scanCount: count(),
    })
    .from(scans);

  return {
    performance: Math.round(Number(result.performance ?? 0)),
    seo: Math.round(Number(result.seo ?? 0)),
    accessibility: Math.round(Number(result.accessibility ?? 0)),
    trustSecurity: Math.round(Number(result.trustSecurity ?? 0)),
    standards: Math.round(Number(result.standards ?? 0)),
    aiReadiness: Math.round(Number(result.aiReadiness ?? 0)),
    scanCount: result.scanCount,
  };
}
