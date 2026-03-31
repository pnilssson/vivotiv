import * as Sentry from "@sentry/node";
import type { CheckResult } from "@vivotiv/shared";

import { checkBrokenLinks } from "./checks/broken-links";

export interface LinkCheckResults {
  checks: CheckResult[];
}

export async function runLinkChecks(url: string): Promise<LinkCheckResults> {
  try {
    const result = await checkBrokenLinks(url);
    return { checks: result ? [result] : [] };
  } catch (error) {
    Sentry.logger.warn("Link checks failed, skipping", {
      error: String(error),
    });
    return { checks: [] };
  }
}
