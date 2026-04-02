import { eq } from "drizzle-orm";

import type { Database } from "../client";
import { outreachEmails } from "../schema";

type CreateOutreachEmailInput = {
  leadId: string;
  scanId: string;
  toEmail: string;
  fromEmail: string;
  replyTo: string | null;
  subject: string;
  body: string;
  resultsUrl: string;
  unsubscribeUrl: string;
  provider: string;
};

type MarkOutreachEmailSentInput = {
  providerMessageId: string | null;
};

type MarkOutreachEmailFailedInput = {
  failureReason: string;
};

export async function createOutreachEmail(
  db: Database,
  input: CreateOutreachEmailInput,
) {
  const [email] = await db
    .insert(outreachEmails)
    .values({
      leadId: input.leadId,
      scanId: input.scanId,
      toEmail: input.toEmail,
      fromEmail: input.fromEmail,
      replyTo: input.replyTo,
      subject: input.subject,
      body: input.body,
      resultsUrl: input.resultsUrl,
      unsubscribeUrl: input.unsubscribeUrl,
      provider: input.provider,
      status: "pending",
    })
    .returning({ id: outreachEmails.id });

  return email;
}

export async function markOutreachEmailSent(
  db: Database,
  outreachEmailId: string,
  input: MarkOutreachEmailSentInput,
) {
  await db
    .update(outreachEmails)
    .set({
      status: "sent",
      providerMessageId: input.providerMessageId,
      sentAt: new Date(),
      failureReason: null,
    })
    .where(eq(outreachEmails.id, outreachEmailId));
}

export async function markOutreachEmailFailed(
  db: Database,
  outreachEmailId: string,
  input: MarkOutreachEmailFailedInput,
) {
  await db
    .update(outreachEmails)
    .set({
      status: "failed",
      failureReason: input.failureReason,
    })
    .where(eq(outreachEmails.id, outreachEmailId));
}
