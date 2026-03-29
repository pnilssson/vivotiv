import { z } from "zod";

import { scanCategoryKeys } from "./categories";

export const CheckStatusSchema = z.enum(["pass", "warn", "fail", "error"]);

export type CheckStatus = z.infer<typeof CheckStatusSchema>;

export const ScoreThresholdsSchema = z.object({
  good: z.string(),
  warn: z.string(),
});

export type ScoreThresholds = z.infer<typeof ScoreThresholdsSchema>;

export const CheckResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: CheckStatusSchema,
  score: z.number().min(0).max(100).nullable(),
  value: z.string().nullable(),
  rawValue: z.number().nullable(),
  rawUnit: z.string().nullable(),
  scoreThresholds: ScoreThresholdsSchema.nullable(),
  weight: z.int().min(1).max(3),
  description: z.string(),
  items: z.array(z.string()).nullable(),
});

export type CheckResult = z.infer<typeof CheckResultSchema>;

export const CategoryResultSchema = z.object({
  score: z.int().min(0).max(100),
  status: CheckStatusSchema,
  metrics: z.array(CheckResultSchema),
  opportunities: z.array(CheckResultSchema),
  diagnostics: z.array(CheckResultSchema),
});

export type CategoryResult = z.infer<typeof CategoryResultSchema>;

const categoryFields = Object.fromEntries(
  scanCategoryKeys.map((key) => [key, CategoryResultSchema.nullable()]),
) as Record<
  (typeof scanCategoryKeys)[number],
  z.ZodNullable<typeof CategoryResultSchema>
>;

export const ScanDetailsV1Schema = z.object({
  version: z.literal(1),
  url: z.string(),
  scannedAt: z.string(),
  ...categoryFields,
});

export type ScanDetailsV1 = z.infer<typeof ScanDetailsV1Schema>;

export const ScanDetailsSchema = z.discriminatedUnion("version", [
  ScanDetailsV1Schema,
]);

export type ScanDetails = z.infer<typeof ScanDetailsSchema>;
