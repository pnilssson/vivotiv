import type { CheckResult } from "@vivotiv/shared";

import { buildCheck } from "./build-check";
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
    checkPoweredByExposure(headers),
  ];
}

function checkCsp(h: HeaderCheckResults): CheckResult {
  const value = h.headers["content-security-policy"];

  if (!value) {
    return buildCheck(
      "csp",
      "Content Security Policy",
      "fail",
      "Missing",
      2,
      "Content Security Policy (CSP) helps prevent cross-site scripting (XSS) and other code injection attacks.",
    );
  }

  const lower = value.toLowerCase();
  const warnings: string[] = [];

  // Check for overly permissive default-src
  if (/default-src\s[^;]*\*/.test(lower)) {
    warnings.push("default-src allows all origins");
  }

  // Check for unsafe directives in script-src (or default-src as fallback)
  const scriptSection =
    lower.match(/script-src\s([^;]*)/)?.[1] ??
    lower.match(/default-src\s([^;]*)/)?.[1] ??
    "";
  if (scriptSection.includes("'unsafe-inline'")) {
    warnings.push("script-src allows unsafe-inline");
  }
  if (scriptSection.includes("'unsafe-eval'")) {
    warnings.push("script-src allows unsafe-eval");
  }

  if (warnings.length > 0) {
    return buildCheck(
      "csp",
      "Content Security Policy",
      "warn",
      `Present but permissive: ${warnings.join(", ")}`,
      2,
      "Content Security Policy (CSP) helps prevent cross-site scripting (XSS) and other code injection attacks.",
    );
  }

  return buildCheck(
    "csp",
    "Content Security Policy",
    "pass",
    "Present",
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
  const hasIncludeSubDomains = value
    .toLowerCase()
    .includes("includesubdomains");

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

  if (!hasIncludeSubDomains) {
    return buildCheck(
      "hsts",
      "HTTP Strict Transport Security",
      "warn",
      `max-age=${maxAge} but missing includeSubDomains`,
      2,
      "HSTS tells browsers to only connect via HTTPS, preventing protocol downgrade attacks. includeSubDomains is required for HSTS preload list eligibility.",
    );
  }

  return buildCheck(
    "hsts",
    "HTTP Strict Transport Security",
    "pass",
    `max-age=${maxAge}; includeSubDomains`,
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

  if (!value) {
    return buildCheck(
      "referrer-policy",
      "Referrer Policy",
      "warn",
      "Missing",
      1,
      "Referrer-Policy controls how much referrer information is included with requests, protecting user privacy.",
    );
  }

  if (value.toLowerCase() === "unsafe-url") {
    return buildCheck(
      "referrer-policy",
      "Referrer Policy",
      "warn",
      "unsafe-url leaks full URLs to third parties",
      1,
      "Referrer-Policy controls how much referrer information is included with requests, protecting user privacy.",
    );
  }

  return buildCheck(
    "referrer-policy",
    "Referrer Policy",
    "pass",
    value,
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

function checkPoweredByExposure(h: HeaderCheckResults): CheckResult {
  const exposureHeaders = [
    "x-powered-by",
    "x-aspnet-version",
    "x-generator",
  ];

  const exposed = exposureHeaders
    .filter((name) => h.headers[name])
    .map((name) => `${name}: ${h.headers[name]}`);

  if (exposed.length > 0) {
    return buildCheck(
      "powered-by-exposure",
      "Technology Exposure Headers",
      "warn",
      exposed.join(", "),
      1,
      "Headers like X-Powered-By reveal server technology, making targeted attacks easier. Remove them in production.",
    );
  }

  return buildCheck(
    "powered-by-exposure",
    "Technology Exposure Headers",
    "pass",
    "Not exposed",
    1,
    "Headers like X-Powered-By reveal server technology, making targeted attacks easier.",
  );
}

