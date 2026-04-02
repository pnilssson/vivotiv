import { hasScanForDomain, isLeadUnsubscribed, upsertLead } from "@vivotiv/db";
import type { Database } from "@vivotiv/db";
import { OUTREACH_SCAN_SOURCE } from "@vivotiv/shared";

import { sendInngestEvent } from "../../lib/inngest";

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

type OutreachInput = {
  url: string;
  email: string;
  businessName?: string;
};

type OutreachResult =
  | { status: "queued"; leadId: string }
  | { status: "skipped"; reason: string };

export async function submitOutreach(
  db: Database,
  input: OutreachInput,
  inngestEventKey: string,
  inngestBaseUrl?: string,
): Promise<OutreachResult> {
  const domain = extractDomain(input.url);

  const alreadyScanned = await hasScanForDomain(db, domain);
  if (alreadyScanned) {
    return { status: "skipped", reason: "Domain already has a scan" };
  }

  const lead = await upsertLead(db, { email: input.email });

  const unsubscribed = await isLeadUnsubscribed(db, lead.id);
  if (unsubscribed) {
    return { status: "skipped", reason: "Lead is unsubscribed" };
  }

  await sendInngestEvent(
    inngestEventKey,
    {
      name: "scan.requested",
      data: {
        leadId: lead.id,
        url: input.url,
        locale: "sv",
        source: OUTREACH_SCAN_SOURCE,
        businessName: input.businessName,
      },
    },
    inngestBaseUrl,
  );

  return { status: "queued", leadId: lead.id };
}
