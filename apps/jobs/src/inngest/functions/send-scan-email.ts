import * as Sentry from "@sentry/node";
import { createDb, getLeadById } from "@vivotiv/db";
import type { Locale, ScanDetailsV1 } from "@vivotiv/shared";

import { sendScanCompleteEmail } from "../../email/send-scan-complete";
import { env } from "../../env";
import { inngest } from "../client";

const db = createDb(env.DATABASE_URL);

export const sendScanEmailFunction = inngest.createFunction(
  {
    id: "send-scan-email",
    retries: 3,
  },
  { event: "scan.completed" },
  async ({ event, logger }) => {
    const { leadId, scanId, url, locale, overallScore, details } =
      event.data as {
        leadId: string;
        scanId: string;
        url: string;
        locale: Locale;
        overallScore: number;
        details: ScanDetailsV1;
      };

    const lead = await getLeadById(db, leadId);
    if (!lead) {
      logger.warn("Lead not found, skipping email", { leadId });
      return;
    }

    await sendScanCompleteEmail({
      to: lead.email,
      scanId,
      url,
      locale,
      overallScore,
      details,
    });

    logger.info("Scan email sent", { leadId, scanId });
    Sentry.logger.info("Scan email sent", { leadId, scanId });
  },
);
