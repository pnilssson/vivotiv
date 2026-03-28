import { z } from "zod";

import { LocaleSchema } from "../i18n/locales";

export const ScanSubmissionSchema = z.object({
  url: z.url().max(2048),
  email: z.email().max(320),
  locale: LocaleSchema,
});

export type ScanSubmission = z.infer<typeof ScanSubmissionSchema>;

export const ScanSubmissionResponseSchema = z.object({
  status: z.literal("accepted"),
  leadId: z.string().uuid(),
  message: z.string(),
});

export type ScanSubmissionResponse = z.infer<
  typeof ScanSubmissionResponseSchema
>;
