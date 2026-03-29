import type { CheckResult } from "@vivotiv/shared";

import type { HeaderCheckResults } from "../header-checks";

export function extractSecurityHeaderChecks(
  headers: HeaderCheckResults,
): CheckResult[] {
  return [
    checkCsp(headers),
    checkHsts(headers),
    checkXFrameOptions(headers),
    checkXContentTypeOptions(headers),
    checkReferrerPolicy(headers),
    checkPermissionsPolicy(headers),
    checkServerExposure(headers),
  ];
}

function checkCsp(h: HeaderCheckResults): CheckResult {
  const value = h.headers["content-security-policy"];
  return buildCheck(
    "csp",
    "Content Security Policy",
    value ? "pass" : "fail",
    value ? "Present" : "Missing",
    2,
    "Content Security Policy (CSP) helps prevent cross-site scripting (XSS) and other code injection attacks.",
  );
}

function checkHsts(h: HeaderCheckResults): CheckResult {
  const value = h.headers["strict-transport-security"];
  if (!value) {
    return buildCheck(
      "hsts",
      "HTTP Strict Transport Security",
      "fail",
      "Missing",
      2,
      "HSTS tells browsers to only connect via HTTPS, preventing protocol downgrade attacks.",
    );
  }

  const maxAgeMatch = value.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;

  if (maxAge < 31536000) {
    return buildCheck(
      "hsts",
      "HTTP Strict Transport Security",
      "warn",
      `max-age=${maxAge} (recommended: >= 31536000)`,
      2,
      "HSTS tells browsers to only connect via HTTPS, preventing protocol downgrade attacks.",
    );
  }

  return buildCheck(
    "hsts",
    "HTTP Strict Transport Security",
    "pass",
    `max-age=${maxAge}`,
    2,
    "HSTS tells browsers to only connect via HTTPS, preventing protocol downgrade attacks.",
  );
}

function checkXFrameOptions(h: HeaderCheckResults): CheckResult {
  const value = h.headers["x-frame-options"];
  return buildCheck(
    "x-frame-options",
    "X-Frame-Options",
    value ? "pass" : "warn",
    value ?? "Missing",
    1,
    "X-Frame-Options prevents your site from being embedded in iframes, protecting against clickjacking attacks.",
  );
}

function checkXContentTypeOptions(h: HeaderCheckResults): CheckResult {
  const value = h.headers["x-content-type-options"];
  return buildCheck(
    "x-content-type-options",
    "X-Content-Type-Options",
    value?.toLowerCase() === "nosniff" ? "pass" : "warn",
    value ?? "Missing",
    1,
    "X-Content-Type-Options: nosniff prevents browsers from MIME-type sniffing, reducing exposure to drive-by download attacks.",
  );
}

function checkReferrerPolicy(h: HeaderCheckResults): CheckResult {
  const value = h.headers["referrer-policy"];
  return buildCheck(
    "referrer-policy",
    "Referrer Policy",
    value ? "pass" : "warn",
    value ?? "Missing",
    1,
    "Referrer-Policy controls how much referrer information is included with requests, protecting user privacy.",
  );
}

function checkPermissionsPolicy(h: HeaderCheckResults): CheckResult {
  const value =
    h.headers["permissions-policy"] ?? h.headers["feature-policy"];
  return buildCheck(
    "permissions-policy",
    "Permissions Policy",
    value ? "pass" : "warn",
    value ? "Present" : "Missing",
    1,
    "Permissions-Policy controls which browser features (camera, microphone, geolocation) your site can use.",
  );
}

function checkServerExposure(h: HeaderCheckResults): CheckResult {
  const value = h.headers["server"];
  if (!value) {
    return buildCheck(
      "server-exposure",
      "Server Version Exposure",
      "pass",
      "Not exposed",
      1,
      "Exposing the server software and version makes targeted attacks easier.",
    );
  }

  // Check if version number is exposed (e.g., "Apache/2.4.51" or "nginx/1.21.3")
  const hasVersion = /\/\d/.test(value);
  return buildCheck(
    "server-exposure",
    "Server Version Exposure",
    hasVersion ? "warn" : "pass",
    value,
    1,
    "Exposing the server software and version makes targeted attacks easier.",
  );
}

function buildCheck(
  id: string,
  name: string,
  status: "pass" | "warn" | "fail",
  value: string,
  weight: 1 | 2 | 3,
  description: string,
): CheckResult {
  return {
    id,
    name,
    status,
    score: status === "pass" ? 100 : status === "warn" ? 50 : 0,
    value,
    rawValue: null,
    rawUnit: null,
    scoreThresholds: null,
    weight,
    description,
    items: null,
  };
}
