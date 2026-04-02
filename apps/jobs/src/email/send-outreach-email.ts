import { render } from "@react-email/components";

import { env } from "../env";
import { resend } from "./client";
import { OutreachEmail } from "./templates/outreach-email";

export const OUTREACH_EMAIL_PROVIDER = "resend";
export const OUTREACH_EMAIL_SUBJECT = "Öka förtroendet hos era hemsidebesökare";

export function getOutreachFromEmail() {
  return `Pär från ${env.EMAIL_FROM}`;
}

export function getOutreachReplyTo() {
  return env.OUTREACH_REPLY_TO;
}

type SendOutreachEmailInput = {
  to: string;
  body: string;
  resultsUrl: string;
  unsubscribeUrl: string;
};

type SendOutreachEmailResult = {
  providerMessageId: string | null;
};

export async function sendOutreachEmail(
  input: SendOutreachEmailInput,
): Promise<SendOutreachEmailResult> {
  const html = await render(
    OutreachEmail({
      body: input.body,
      resultsUrl: input.resultsUrl,
      unsubscribeUrl: input.unsubscribeUrl,
    }),
  );

  const fromEmail = getOutreachFromEmail();
  const replyTo = getOutreachReplyTo();

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    replyTo,
    to: input.to,
    subject: OUTREACH_EMAIL_SUBJECT,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return {
    providerMessageId: data?.id ?? null,
  };
}
