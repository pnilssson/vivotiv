import { createLead } from "@vivotiv/db";
import type { Database } from "@vivotiv/db";
import type { ScanSubmission } from "@vivotiv/shared";

export async function submitScan(db: Database, payload: ScanSubmission) {
  const lead = await createLead(db, {
    email: payload.email,
    url: payload.url,
  });

  return {
    status: "accepted" as const,
    leadId: lead.id,
    message: `Scan request accepted for ${payload.url}`,
  };
}
