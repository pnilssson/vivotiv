export const scanCategoryKeys = [
  "trustSecurity",
  "accessibility",
  "seo",
  "performance",
  "standards",
  "aiReadiness",
] as const;

export type ScanCategoryKey = (typeof scanCategoryKeys)[number];
