// Web Crypto implementation (CF Workers). Node.js counterpart: apps/jobs/src/outreach/unsubscribe-token.ts
const encoder = new TextEncoder();

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

export async function createUnsubscribeToken(
  leadId: string,
  secret: string,
): Promise<string> {
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(leadId));
  return `${leadId}.${toHex(signature)}`;
}

export async function verifyUnsubscribeToken(
  token: string,
  secret: string,
): Promise<string | null> {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return null;

  const leadId = token.substring(0, dotIndex);
  const signature = token.substring(dotIndex + 1);

  const key = await getKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    fromHex(signature),
    encoder.encode(leadId),
  );

  return valid ? leadId : null;
}
