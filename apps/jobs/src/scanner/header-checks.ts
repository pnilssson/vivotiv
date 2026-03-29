import * as https from "node:https";
import type { TLSSocket } from "node:tls";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export interface TlsInspection {
  protocol: string | null;
  authorized: boolean;
  authorizationError: string | null;
  validTo: string | null;
  daysUntilExpiry: number | null;
}

export interface HeaderCheckResults {
  url: string;
  isHttps: boolean;
  headers: Record<string, string>;
  statusCode: number;
  tls: TlsInspection | null;
}

async function inspectTls(url: string): Promise<TlsInspection | null> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = https.request(
      parsed,
      {
        method: "HEAD",
        rejectUnauthorized: false,
        headers: { "User-Agent": USER_AGENT },
      },
      (response) => {
        const socket = response.socket as TLSSocket;
        const cert = socket.getPeerCertificate() as
          | { valid_to?: string }
          | Record<string, never>;

        const validToRaw =
          typeof cert.valid_to === "string" ? cert.valid_to : null;
        const validToDate = validToRaw ? new Date(validToRaw) : null;
        const isValidDate =
          validToDate instanceof Date && !Number.isNaN(validToDate.valueOf());

        const daysUntilExpiry = isValidDate
          ? Math.ceil((validToDate.valueOf() - Date.now()) / 86_400_000)
          : null;

        resolve({
          protocol: socket.getProtocol() ?? null,
          authorized: socket.authorized,
          authorizationError: socket.authorizationError
            ? String(socket.authorizationError)
            : null,
          validTo: isValidDate ? validToDate.toISOString() : null,
          daysUntilExpiry,
        });
      },
    );

    request.setTimeout(10_000, () => {
      request.destroy(new Error(`TLS inspection timed out for ${url}`));
    });
    request.on("error", reject);
    request.end();
  });
}

export async function runHeaderChecks(
  url: string,
): Promise<HeaderCheckResults> {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
    headers: { "User-Agent": USER_AGENT },
  });

  const headers: Record<string, string> = {};
  for (const [key, value] of response.headers) {
    headers[key.toLowerCase()] = value;
  }

  const tls = response.url.startsWith("https://")
    ? await inspectTls(response.url).catch(() => null)
    : null;

  return {
    url: response.url,
    isHttps: response.url.startsWith("https://"),
    headers,
    statusCode: response.status,
    tls,
  };
}
