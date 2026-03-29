import { getScanById, upsertLead } from "@vivotiv/db";
import type { Database } from "@vivotiv/db";
import type { ScanResponse, ScanSubmission } from "@vivotiv/shared";

export async function submitScan(
  db: Database,
  payload: ScanSubmission,
  inngestEventKey: string,
) {
  const lead = await upsertLead(db, {
    email: payload.email,
  });

  await sendInngestEvent(inngestEventKey, {
    name: "scan.requested",
    data: { leadId: lead.id, url: payload.url },
  });

  return {
    status: "accepted" as const,
    leadId: lead.id,
    message: `Scan request accepted for ${payload.url}`,
  };
}

const SCAN_CACHE_TTL = 86400;

export async function fetchScan(
  db: Database,
  cache: KVNamespace,
  scanId: string,
): Promise<ScanResponse | null> {
  const cacheKey = `scan:${scanId}`;

  const cached = await cache.get<ScanResponse>(cacheKey, "json");
  if (cached) {
    return cached;
  }

  const scan = await getScanById(db, scanId);
  if (!scan) {
    return null;
  }

  const response: ScanResponse = {
    id: scan.id,
    url: scan.url,
    overallScore: scan.overallScore,
    performanceScore: scan.performanceScore,
    seoScore: scan.seoScore,
    accessibilityScore: scan.accessibilityScore,
    legalScore: scan.legalScore,
    securityScore: scan.securityScore,
    standardsScore: scan.standardsScore,
    details: scan.details as ScanResponse["details"],
    createdAt: scan.createdAt.toISOString(),
  };

  await cache.put(cacheKey, JSON.stringify(response), {
    expirationTtl: SCAN_CACHE_TTL,
  });

  return response;
}

async function sendInngestEvent(
  eventKey: string,
  event: { name: string; data: Record<string, unknown> },
) {
  const response = await fetch(`https://inn.gs/e/${eventKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to send Inngest event (status ${response.status}): ${body}`,
    );
  }
}
