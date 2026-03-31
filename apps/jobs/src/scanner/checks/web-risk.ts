import type { CheckResult } from "@vivotiv/shared";

import { buildCheck } from "./build-check";

interface WebRiskResponse {
  threat?: {
    threatTypes: string[];
    expireTime: string;
  };
}

export async function checkWebRisk(
  url: string,
  apiKey: string,
): Promise<CheckResult> {
  const params = new URLSearchParams({
    uri: url,
    key: apiKey,
  });
  params.append("threatTypes", "MALWARE");
  params.append("threatTypes", "SOCIAL_ENGINEERING");
  params.append("threatTypes", "UNWANTED_SOFTWARE");

  const response = await fetch(
    `https://webrisk.googleapis.com/v1/uris:search?${params.toString()}`,
    { signal: AbortSignal.timeout(10_000) },
  );

  if (!response.ok) {
    throw new Error(`Web Risk API returned ${response.status}`);
  }

  const data = (await response.json()) as WebRiskResponse;

  if (data.threat) {
    const threats = data.threat.threatTypes ?? [];
    return buildCheck(
      "google-web-risk",
      "Google Safe Browsing",
      "fail",
      "Threats detected",
      3,
      "Google's Web Risk API checks URLs against the same threat database used by Chrome to warn users about dangerous sites.",
      threats.map((t) => t.replace(/_/g, " ").toLowerCase()),
    );
  }

  return buildCheck(
    "google-web-risk",
    "Google Safe Browsing",
    "pass",
    "No threats detected",
    3,
    "Google's Web Risk API checks URLs against the same threat database used by Chrome to warn users about dangerous sites.",
  );
}

