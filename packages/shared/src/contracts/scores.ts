import { z } from "zod";

export const AverageScoresResponseSchema = z.object({
  performance: z.number(),
  seo: z.number(),
  accessibility: z.number(),
  legal: z.number(),
  security: z.number(),
  standards: z.number(),
  scanCount: z.number(),
});

export type AverageScoresResponse = z.infer<typeof AverageScoresResponseSchema>;
