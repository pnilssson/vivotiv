import * as Sentry from "@sentry/node";
import type { CheckResult } from "@vivotiv/shared";

import { checkObservatory } from "./checks/observatory";
import { checkWebRisk } from "./checks/web-risk";

export interface ApiCheckResults {
  securityChecks: CheckResult[];
}

export async function runApiChecks(
  url: string,
  options: { googleCloudApiKey?: string },
): Promise<ApiCheckResults> {
  const host = new URL(url).hostname;
  const securityChecks: CheckResult[] = [];

  const promises: Array<{
    id: string;
    promise: Promise<CheckResult>;
  }> = [{ id: "mdn-observatory", promise: checkObservatory(host) }];

  if (options.googleCloudApiKey) {
    promises.push({
      id: "google-web-risk",
      promise: checkWebRisk(url, options.googleCloudApiKey),
    });
  }

  const results = await Promise.allSettled(
    promises.map((p) => p.promise),
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      securityChecks.push(result.value);
    } else {
      Sentry.logger.warn(`External check ${promises[i].id} failed, skipping`, {
        error: String(result.reason),
      });
    }
  }

  return { securityChecks };
}
