import * as Sentry from "@sentry/node";
import {
  createDb,
  createOutreachEmail,
  getLeadById,
  getScanById,
  markOutreachEmailFailed,
  markOutreachEmailSent,
} from "@vivotiv/db";
import type { ScanDetailsV1 } from "@vivotiv/shared";
import { OUTREACH_SCAN_SOURCE } from "@vivotiv/shared";
import { NonRetriableError } from "inngest";

import {
  getOutreachFromEmail,
  getOutreachReplyTo,
  OUTREACH_EMAIL_PROVIDER,
  OUTREACH_EMAIL_SUBJECT,
  sendOutreachEmail,
} from "../../email/send-outreach-email";
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
        trustSecurity: details.trustSecurity,
        accessibility: details.accessibility,
        performance: details.performance,
        seo: details.seo,
        standards: details.standards,
        aiReadiness: details.aiReadiness,
      }),
    );

    const gate = await step.run("check-send-gates", () =>
      shouldSendOutreach(
        scan.overallScore,
        {
          trustSecurity: scan.trustSecurityScore,
          accessibility: scan.accessibilityScore,
          performance: scan.performanceScore,
          seo: scan.seoScore,
          standards: scan.standardsScore,
          aiReadiness: scan.aiReadinessScore,
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

    const outreachEmail = await step.run("log-email-pending", () =>
      createOutreachEmail(db, {
        leadId,
        scanId,
        toEmail: lead.email,
        fromEmail: getOutreachFromEmail(),
        replyTo: getOutreachReplyTo(),
        subject: OUTREACH_EMAIL_SUBJECT,
        body: emailBody,
        resultsUrl,
        unsubscribeUrl,
        provider: OUTREACH_EMAIL_PROVIDER,
      }),
    );

    try {
      const sendResult = await step.run("send-email", () =>
        sendOutreachEmail({
          to: lead.email,
          body: emailBody,
          resultsUrl,
          unsubscribeUrl,
        }),
      );

      await step.run("log-email-sent", () =>
        markOutreachEmailSent(db, outreachEmail.id, {
          providerMessageId: sendResult.providerMessageId,
        }),
      );
    } catch (error) {
      await step.run("log-email-failed", () =>
        markOutreachEmailFailed(db, outreachEmail.id, {
          failureReason: String(error),
        }),
      );

      throw error;
    }

    Sentry.logger.info("Outreach email sent", { leadId, scanId, to: lead.email });

    return { status: "sent" };
  },
);
