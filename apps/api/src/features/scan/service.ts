import {
  ScanSubmissionResponseSchema,
  scanSource,
  type ScanSubmission,
} from "@vivotiv/shared";

export function acceptScanSubmission(payload: ScanSubmission) {
  const response = {
    status: "accepted" as const,
    source: scanSource,
    message: `Scan request accepted for ${payload.url}`,
  };

  return ScanSubmissionResponseSchema.parse(response);
}
