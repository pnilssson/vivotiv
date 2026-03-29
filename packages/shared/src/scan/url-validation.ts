const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "0.0.0.0",
  "::1",
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

/** Synchronous URL format check (safe for edge/worker runtimes). */
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

/** Check if a resolved IP address is private/local. */
export function isPrivateIp(ip: string): boolean {
  // IPv4
  if (BLOCKED_IP_PREFIXES.some((prefix) => ip.startsWith(prefix))) {
    return true;
  }

  // IPv6 loopback
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true;

  // IPv6 unspecified address
  if (ip === "::" || ip === "0:0:0:0:0:0:0:0") return true;

  // IPv6 link-local (fe80::/10)
  if (ip.toLowerCase().startsWith("fe80:")) return true;

  // IPv6 site-local (deprecated but still non-public)
  if (ip.toLowerCase().startsWith("fec") || ip.toLowerCase().startsWith("fed")) {
    return true;
  }

  // IPv6 unique local (fc00::/7 covers fc00:: and fd00::)
  const first2 = ip.toLowerCase().slice(0, 2);
  if (first2 === "fc" || first2 === "fd") return true;

  // IPv6 multicast
  if (first2 === "ff") return true;

  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  const v4Mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4Mapped && isPrivateIp(v4Mapped[1])) return true;

  return false;
}
