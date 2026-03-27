import {
  ScanSubmissionResponseSchema,
  type ScanSubmission,
  type ScanSubmissionResponse,
} from "@vivotiv/shared";

import { publicEnv } from "@/config/public";

export async function submitScan(
  payload: ScanSubmission,
): Promise<ScanSubmissionResponse> {
  const response = await fetch(`${publicEnv.apiBaseUrl}/v1/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Scan submission failed");
  }

  const json = await response.json();
  const parsed = ScanSubmissionResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Invalid scan submission response");
  }

  return parsed.data;
}
