import type { LighthouseResult } from "../lighthouse";

import {
  extractLighthouseCategory,
  type LighthouseCategoryExtraction,
} from "./lighthouse-helpers";

export function extractSeoChecks(
  lhr: LighthouseResult,
): LighthouseCategoryExtraction {
  return extractLighthouseCategory(lhr, "seo");
}
