import { z } from "zod";

import { LocaleSchema } from "../i18n/locales";
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
