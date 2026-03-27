import { z } from "zod";

import { LocaleSchema } from "../i18n/locales";

export const scanSource = "scan" as const;

export const ScanSubmissionSchema = z.object({
  url: z.url().max(2048),
  email: z.email().max(320),
  locale: LocaleSchema,
  source: z.literal(scanSource).default(scanSource),
});

export type ScanSubmission = z.infer<typeof ScanSubmissionSchema>;

export const ScanSubmissionResponseSchema = z.object({
  status: z.literal("accepted"),
  source: z.literal(scanSource),
  message: z.string(),
});

export type ScanSubmissionResponse = z.infer<
  typeof ScanSubmissionResponseSchema
>;
