import { render } from "@react-email/components";

import { env } from "../env";
import { resend } from "./client";
import { OutreachEmail } from "./templates/outreach-email";

type SendOutreachEmailInput = {
  to: string;
  body: string;
  resultsUrl: string;
  unsubscribeUrl: string;
};

export async function sendOutreachEmail(
  input: SendOutreachEmailInput,
): Promise<void> {
  const html = await render(
    OutreachEmail({
      body: input.body,
      resultsUrl: input.resultsUrl,
      unsubscribeUrl: input.unsubscribeUrl,
    }),
  );

  const { error } = await resend.emails.send({
    from: `Pär från ${env.EMAIL_FROM}`,
    replyTo: env.OUTREACH_REPLY_TO,
    to: input.to,
    subject: "Öka förtroendet hos era hemsidebesökare",
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
