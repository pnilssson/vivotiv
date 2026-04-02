import * as Sentry from "@sentry/node";
import { createDb, getLeadById, getScanById } from "@vivotiv/db";
import type { ScanDetailsV1 } from "@vivotiv/shared";
import { OUTREACH_SCAN_SOURCE } from "@vivotiv/shared";
import { NonRetriableError } from "inngest";

import { sendOutreachEmail } from "../../email/send-outreach-email";
import { env } from "../../env";
import { generateOutreachEmail } from "../../outreach/generate-email";
import { selectFindings } from "../../outreach/select-findings";
import { shouldSendOutreach } from "../../outreach/send-gates";
import { createUnsubscribeToken } from "../../outreach/unsubscribe-token";
import { inngest } from "../client";

const db = createDb(env.DATABASE_URL);

export const sendOutreachEmailFunction = inngest.createFunction(
  {
    id: "send-outreach-email",
    retries: 2,
    concurrency: [{ limit: 2 }],
    onFailure: async ({ error, event }) => {
      const { leadId, scanId } = event.data.event.data as {
        leadId: string;
        scanId: string;
      };
      Sentry.captureException(error, {
        tags: { function: "send-outreach-email" },
        extra: { leadId, scanId },
      });
      Sentry.logger.error("send-outreach-email failed permanently", {
        leadId,
        scanId,
        error: String(error),
      });
    },
  },
  { event: "scan.completed" },
  async ({ event, step }) => {
    const { leadId, scanId, source, businessName } = event.data as {
      leadId: string;
      scanId: string;
      locale: string;
      source?: string;
      businessName?: string;
    };

    if (source !== OUTREACH_SCAN_SOURCE) {
      return;
    }

    Sentry.logger.info("Processing outreach email", { leadId, scanId });

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

    const details = scan.details as ScanDetailsV1;

    const findings = await step.run("select-findings", () =>
      selectFindings({
        legal: details.legal,
        accessibility: details.accessibility,
        performance: details.performance,
        seo: details.seo,
        security: details.security,
        standards: details.standards,
      }),
    );

    const gate = await step.run("check-send-gates", () =>
      shouldSendOutreach(
        scan.overallScore,
        {
          legal: scan.legalScore,
          accessibility: scan.accessibilityScore,
          performance: scan.performanceScore,
          seo: scan.seoScore,
          security: scan.securityScore,
          standards: scan.standardsScore,
        },
        findings.length,
      ),
    );

    if (!gate.send) {
      Sentry.logger.info("Outreach skipped by send gate", {
        leadId,
        scanId,
        reason: gate.reason,
      });
      return { status: "skipped", reason: gate.reason };
    }

    const resultsUrl = `https://vivotiv.se/sv/scan/${scanId}`;
    const unsubscribeToken = createUnsubscribeToken(leadId, env.UNSUBSCRIBE_SECRET);
    const unsubscribeUrl = `https://vivotiv.se/sv/unsubscribe?token=${unsubscribeToken}`;

    const emailBody = await step.run("generate-email", () =>
      generateOutreachEmail({
        businessName,
        url: scan.url,
        overallScore: scan.overallScore,
        findings,
        resultsUrl,
      }),
    );

    await step.run("send-email", () =>
      sendOutreachEmail({
        to: lead.email,
        body: emailBody,
        resultsUrl,
        unsubscribeUrl,
      }),
    );

    Sentry.logger.info("Outreach email sent", { leadId, scanId, to: lead.email });

    return { status: "sent" };
  },
);
