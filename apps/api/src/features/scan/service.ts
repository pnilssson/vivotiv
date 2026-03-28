import type { Database } from "@vivotiv/db";
import { leads } from "@vivotiv/db";
import type { ScanSubmission } from "@vivotiv/shared";

export async function createLead(db: Database, payload: ScanSubmission) {
  const [lead] = await db
    .insert(leads)
    .values({
      email: payload.email,
      url: payload.url,
    })
    .returning({ id: leads.id });

  return {
    status: "accepted" as const,
    leadId: lead.id,
    message: `Scan request accepted for ${payload.url}`,
  };
}
