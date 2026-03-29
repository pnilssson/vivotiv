export const scanCategoryKeys = [
  "legal",
  "accessibility",
  "seo",
  "performance",
  "security",
  "standards",
] as const;

export type ScanCategoryKey = (typeof scanCategoryKeys)[number];
