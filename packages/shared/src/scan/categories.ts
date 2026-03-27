export const scanCategoryKeys = [
  "performance",
  "seo",
  "accessibility",
  "legal",
  "security",
  "standards",
] as const;

export type ScanCategoryKey = (typeof scanCategoryKeys)[number];
