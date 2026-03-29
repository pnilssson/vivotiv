import { z } from "zod";

import { LocaleSchema } from "../i18n/locales";
import { ScanDetailsSchema } from "../scan/results";
import { isSafeUrl } from "../scan/url-validation";

export const ScanSubmissionSchema = z.object({
  url: z.url().check(
    z.refine((url) => url.length <= 2048, "URL must be 2048 characters or less"),
    z.refine((url) => isSafeUrl(url), "URL must be a public HTTP(S) address"),
  ),
  email: z.email(),
  locale: LocaleSchema,
});

export type ScanSubmission = z.infer<typeof ScanSubmissionSchema>;

export const ScanSubmissionResponseSchema = z.object({
  status: z.literal("accepted"),
  leadId: z.uuid(),
  message: z.string(),
});

export type ScanSubmissionResponse = z.infer<
  typeof ScanSubmissionResponseSchema
>;

export const ScanResponseSchema = z.object({
  id: z.uuid(),
  url: z.string(),
  overallScore: z.number().nullable(),
  performanceScore: z.number().nullable(),
  seoScore: z.number().nullable(),
  accessibilityScore: z.number().nullable(),
  legalScore: z.number().nullable(),
  securityScore: z.number().nullable(),
  standardsScore: z.number().nullable(),
  details: ScanDetailsSchema.nullable(),
  createdAt: z.string(),
});

export type ScanResponse = z.infer<typeof ScanResponseSchema>;
