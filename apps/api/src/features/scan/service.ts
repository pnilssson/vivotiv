import { createLead } from "@vivotiv/db";
import type { Database } from "@vivotiv/db";
import type { ScanSubmission } from "@vivotiv/shared";

export async function submitScan(
  db: Database,
  payload: ScanSubmission,
  inngestEventKey: string,
) {
  const lead = await createLead(db, {
    email: payload.email,
    url: payload.url,
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

async function sendInngestEvent(
  eventKey: string,
  event: { name: string; data: Record<string, unknown> },
) {
  const response = await fetch(`https://inn.gs/e/${eventKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    console.error("Failed to send Inngest event", {
      status: response.status,
      body: await response.text(),
    });
  }
}
