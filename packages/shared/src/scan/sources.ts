export const scanSources = ["scan", "outreach"] as const;

export type ScanSource = (typeof scanSources)[number];

export const DEFAULT_SCAN_SOURCE: ScanSource = "scan";
export const OUTREACH_SCAN_SOURCE: ScanSource = "outreach";
