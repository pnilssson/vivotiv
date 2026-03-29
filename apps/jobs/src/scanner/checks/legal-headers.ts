import type { CheckResult } from "@vivotiv/shared";

import type { HeaderCheckResults } from "../header-checks";

export function extractLegalHeaderChecks(
  headers: HeaderCheckResults,
): CheckResult[] {
  return [checkSsl(headers)];
}

function checkSsl(headers: HeaderCheckResults): CheckResult {
  if (!headers.isHttps) {
    return {
      id: "ssl-certificate",
      name: "SSL Certificate",
      status: "fail",
      score: 0,
      value: "No HTTPS",
      rawValue: null,
      rawUnit: null,
      scoreThresholds: null,
      weight: 2,
      description:
        "A valid SSL certificate is required for secure data transmission. Chrome shows a 'Not Secure' warning without it.",
      items: null,
    };
  }

  if (!headers.tls) {
    return {
      id: "ssl-certificate",
      name: "SSL Certificate",
      status: "warn",
      score: 50,
      value: "HTTPS enabled but TLS certificate details unavailable",
      rawValue: null,
      rawUnit: null,
      scoreThresholds: null,
      weight: 2,
      description:
        "A valid SSL certificate is required for secure data transmission. TLS certificate details could not be inspected.",
      items: null,
    };
  }

  if (!headers.tls.authorized) {
    return {
      id: "ssl-certificate",
      name: "SSL Certificate",
      status: "fail",
      score: 0,
      value: `TLS authorization failed: ${headers.tls.authorizationError ?? "Unknown error"}`,
      rawValue: null,
      rawUnit: null,
      scoreThresholds: null,
      weight: 2,
      description:
        "TLS certificate chain is not trusted. Browsers will warn users that the connection is not secure.",
      items: null,
    };
  }

  const protocol = headers.tls.protocol ?? "unknown";
  if (protocol === "TLSv1" || protocol === "TLSv1.1") {
    return {
      id: "ssl-certificate",
      name: "SSL Certificate",
      status: "warn",
      score: 50,
      value: `Outdated TLS protocol in use: ${protocol}`,
      rawValue: null,
      rawUnit: null,
      scoreThresholds: null,
      weight: 2,
      description:
        "Modern browsers and standards recommend TLS 1.2 or newer.",
      items: null,
    };
  }

  const daysUntilExpiry = headers.tls.daysUntilExpiry;
  if (daysUntilExpiry !== null && daysUntilExpiry < 0) {
    return {
      id: "ssl-certificate",
      name: "SSL Certificate",
      status: "fail",
      score: 0,
      value: `Certificate expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) === 1 ? "" : "s"} ago`,
      rawValue: daysUntilExpiry,
      rawUnit: "day",
      scoreThresholds: null,
      weight: 2,
      description:
        "Expired certificates break trust and can block access in modern browsers.",
      items: null,
    };
  }

  if (daysUntilExpiry !== null && daysUntilExpiry < 30) {
    return {
      id: "ssl-certificate",
      name: "SSL Certificate",
      status: "warn",
      score: 50,
      value: `Certificate expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}`,
      rawValue: daysUntilExpiry,
      rawUnit: "day",
      scoreThresholds: null,
      weight: 2,
      description:
        "Certificates close to expiry increase outage risk and should be renewed proactively.",
      items: null,
    };
  }

  if (daysUntilExpiry !== null) {
    return {
      id: "ssl-certificate",
      name: "SSL Certificate",
      status: "pass",
      score: 100,
      value: `Valid HTTPS (${protocol}, expires in ${daysUntilExpiry} days)`,
      rawValue: daysUntilExpiry,
      rawUnit: "day",
      scoreThresholds: null,
      weight: 2,
      description:
        "A valid SSL certificate is required for secure data transmission. Chrome shows a 'Not Secure' warning without it.",
      items: null,
    };
  }

  return {
    id: "ssl-certificate",
    name: "SSL Certificate",
    status: "pass",
    score: 100,
    value: `Valid HTTPS (${protocol})`,
    rawValue: null,
    rawUnit: null,
    scoreThresholds: null,
    weight: 2,
    description:
      "A valid SSL certificate is required for secure data transmission. Chrome shows a 'Not Secure' warning without it.",
    items: null,
  };
}
