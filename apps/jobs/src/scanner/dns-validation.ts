import { resolve4, resolve6 } from "node:dns/promises";

import { isPrivateIp } from "@vivotiv/shared";

const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

export interface RedirectValidationOptions {
  userAgent?: string;
  timeoutMs?: number;
  maxRedirects?: number;
}

/**
 * Resolve a hostname and reject if any address is private/local.
 * Throws if the hostname resolves to a private IP.
 */
export async function assertPublicHostname(url: string): Promise<void> {
  const hostname = new URL(url).hostname;

  const [ipv4Results, ipv6Results] = await Promise.allSettled([
    resolve4(hostname),
    resolve6(hostname),
  ]);

  const addresses: string[] = [];
  if (ipv4Results.status === "fulfilled") addresses.push(...ipv4Results.value);
  if (ipv6Results.status === "fulfilled") addresses.push(...ipv6Results.value);

  if (addresses.length === 0) {
    throw new Error(`DNS resolution failed for ${hostname}`);
  }

  for (const ip of addresses) {
    if (isPrivateIp(ip)) {
      throw new Error(
        `Hostname ${hostname} resolves to private IP ${ip} - scan blocked`,
      );
    }
  }
}

/**
 * Validates that every HTTP redirect hop resolves to a public IP.
 * Returns the final URL after following redirects.
 */
export async function validatePublicRedirectChain(
  inputUrl: string,
  options: RedirectValidationOptions = {},
): Promise<string> {
  const timeoutMs = options.timeoutMs ?? 15_000;
  const maxRedirects = options.maxRedirects ?? 10;

  let currentUrl = inputUrl;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertPublicHostname(currentUrl);

    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers: options.userAgent
        ? { "User-Agent": options.userAgent }
        : undefined,
    });

    if (!REDIRECT_STATUS.has(response.status)) {
      return currentUrl;
    }

    const location = response.headers.get("location");
    if (!location) {
      throw new Error(
        `Redirect response missing location header at hop ${hop + 1}`,
      );
    }

    currentUrl = new URL(location, currentUrl).toString();
  }

  throw new Error(`Too many redirects while validating ${inputUrl}`);
}
