import type { CheckResult } from "@vivotiv/shared";

import { buildCheck } from "./build-check";

interface ObservatoryResponse {
  grade: string;
  score: number;
  tests_passed: number;
  tests_failed: number;
  tests_quantity: number;
}

export async function checkObservatory(host: string): Promise<CheckResult> {
  const response = await fetch(
    `https://observatory-api.mdn.mozilla.net/api/v2/scan?host=${encodeURIComponent(host)}`,
    {
      method: "POST",
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Observatory API returned ${response.status}`);
  }

  const data = (await response.json()) as ObservatoryResponse;
  const grade = data.grade;
  const items =
    data.tests_failed > 0
      ? [`Grade: ${grade}`, `${data.tests_passed}/${data.tests_quantity} tests passed`]
      : null;

  if (grade === "A+" || grade === "A") {
    return buildCheck(
      "mdn-observatory",
      "Security Headers Grade",
      "pass",
      `Grade ${grade} (${data.score}/${data.tests_quantity} points)`,
      2,
      "Mozilla's HTTP Observatory grades your security header configuration. A strong grade means your server is well-configured to protect visitors.",
      items,
    );
  }

  if (grade === "B" || grade === "C" || grade === "D") {
    return buildCheck(
      "mdn-observatory",
      "Security Headers Grade",
      "warn",
      `Grade ${grade} (${data.score}/${data.tests_quantity} points)`,
      2,
      "Mozilla's HTTP Observatory grades your security header configuration. Your server is missing some recommended security headers.",
      items,
    );
  }

  return buildCheck(
    "mdn-observatory",
    "Security Headers Grade",
    "fail",
    `Grade ${grade} (${data.score}/${data.tests_quantity} points)`,
    2,
    "Mozilla's HTTP Observatory grades your security header configuration. Your server is missing critical security headers.",
    items,
  );
}

