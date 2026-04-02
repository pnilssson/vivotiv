import { z } from "zod";

import { isSafeUrl } from "../scan/url-validation";

export const OutreachSubmissionSchema = z.object({
  url: z.url().check(
    z.refine((url) => url.length <= 2048, "URL must be 2048 characters or less"),
    z.refine((url) => isSafeUrl(url), "URL must be a public HTTP(S) address"),
  ),
  email: z.email(),
  businessName: z.string().optional(),
});

export type OutreachSubmission = z.infer<typeof OutreachSubmissionSchema>;

export const UnsubscribeSchema = z.object({
  token: z.string().min(1),
});
