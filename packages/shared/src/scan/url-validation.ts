const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "0.0.0.0",
  "[::1]",
]);

const BLOCKED_IP_PREFIXES = [
  "127.", // loopback
  "10.", // private class A
  "172.16.", "172.17.", "172.18.", "172.19.", // private class B
  "172.20.", "172.21.", "172.22.", "172.23.",
  "172.24.", "172.25.", "172.26.", "172.27.",
  "172.28.", "172.29.", "172.30.", "172.31.",
  "192.168.", // private class C
  "169.254.", // link-local
  "0.", // current network
];

export function isSafeUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return false;
  }

  if (BLOCKED_IP_PREFIXES.some((prefix) => hostname.startsWith(prefix))) {
    return false;
  }

  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    return false;
  }

  return true;
}
