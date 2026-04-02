// Node.js implementation. Web Crypto counterpart: apps/api/src/features/unsubscribe/token.ts
import { createHmac } from "node:crypto";

export function createUnsubscribeToken(
  leadId: string,
  secret: string,
): string {
  const signature = createHmac("sha256", secret)
    .update(leadId)
    .digest("hex");
  return `${leadId}.${signature}`;
}
