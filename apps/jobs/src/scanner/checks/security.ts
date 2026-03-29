import type { LighthouseResult } from "../lighthouse";

import {
  extractLighthouseCategory,
  type LighthouseCategoryExtraction,
} from "./lighthouse-helpers";

export function extractSecurityChecks(
  lhr: LighthouseResult,
): LighthouseCategoryExtraction {
  return extractLighthouseCategory(lhr, "best-practices");
}
