import type { CheckResult } from "@vivotiv/shared";

import type { HeaderCheckResults } from "../header-checks";

export function extractLegalHeaderChecks(
  headers: HeaderCheckResults,
): CheckResult[] {
  return [checkSsl(headers)];
}

function checkSsl(headers: HeaderCheckResults): CheckResult {
  if (headers.isHttps) {
    return {
      id: "ssl-certificate",
      name: "SSL Certificate",
      status: "pass",
      score: 100,
      value: "Valid HTTPS",
      rawValue: null,
      rawUnit: null,
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
