import { z } from "zod";

export const AverageScoresResponseSchema = z.object({
  performance: z.number(),
  seo: z.number(),
  accessibility: z.number(),
  trustSecurity: z.number(),
  standards: z.number(),
  aiReadiness: z.number(),
  scanCount: z.number(),
});

export type AverageScoresResponse = z.infer<typeof AverageScoresResponseSchema>;
