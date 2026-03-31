import * as Sentry from "@sentry/node";
import { createDb, getLeadById, getScanById } from "@vivotiv/db";
import type { Locale, ScanDetailsV1 } from "@vivotiv/shared";
import { NonRetriableError } from "inngest";

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
  async ({ event, step, logger }) => {
    const { leadId, scanId, locale } = event.data as {
      leadId: string;
      scanId: string;
      locale: Locale;
    };

    const lead = await step.run("get-lead", async () => {
      const l = await getLeadById(db, leadId);
      if (!l) throw new NonRetriableError(`Lead ${leadId} not found`);
      return l;
    });

    const scan = await step.run("get-scan", async () => {
      const s = await getScanById(db, scanId);
      if (!s) throw new NonRetriableError(`Scan ${scanId} not found`);
      if (s.overallScore === null) throw new NonRetriableError(`Scan ${scanId} has no score`);
      return s as typeof s & { overallScore: number };
    });

    await step.run("send-email", () =>
      sendScanCompleteEmail({
        to: lead.email,
        scanId,
        url: scan.url,
        locale,
        overallScore: scan.overallScore,
        details: scan.details as ScanDetailsV1,
      }),
    );

    logger.info("Scan email sent", { leadId, scanId });
    Sentry.logger.info("Scan email sent", { leadId, scanId });
  },
);
