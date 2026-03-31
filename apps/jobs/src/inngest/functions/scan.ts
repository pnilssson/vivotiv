import * as Sentry from "@sentry/node";
import { createDb, createScan } from "@vivotiv/db";
import type { Locale } from "@vivotiv/shared";

import { env } from "../../env";
import { aggregate } from "../../scanner/aggregate";
import { validatePublicRedirectChain } from "../../scanner/dns-validation";
import { runDomChecks } from "../../scanner/dom-checks";
import { runHeaderChecks } from "../../scanner/header-checks";
import { runLighthouse } from "../../scanner/lighthouse";
import { inngest } from "../client";

const db = createDb(env.DATABASE_URL);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

type TrackResults<L, D, H> = {
  lighthouse: L | null;
  dom: D | null;
  headers: H | null;
  errors: Record<"lighthouse" | "dom" | "headers", string | null>;
};

function settleTrack<T>(
  name: string,
  result: PromiseSettledResult<T>,
  url: string,
  logger: { error: (msg: string, ctx: object) => void },
): { value: T | null; error: string | null } {
  if (result.status === "fulfilled") {
    return { value: result.value, error: null };
  }

  const error = String(result.reason);
  logger.error(`${name} track failed`, { url, error });
  Sentry.logger.warn(`${name} track failed`, { url, error });
  return { value: null, error };
}

export const scanFunction = inngest.createFunction(
  {
    id: "scan-website",
    retries: 2,
    timeouts: { finish: "5m" },
    concurrency: [{ limit: 5 }],
    throttle: { limit: 1, period: "10s", key: "event.data.leadId" },
  },
  { event: "scan.requested" },
  async ({ event, step, logger }) => {
    const { leadId, url, locale } = event.data as {
      leadId: string;
      url: string;
      locale: Locale;
    };
    const scanStartedAt = Date.now();
    logger.info("Scan started", { leadId, url });
    Sentry.logger.info("Scan started", { leadId, url });

    /* 1. Validate URL */
    const validatedUrl = await step.run("validate-dns-redirect-chain", () =>
      validatePublicRedirectChain(url, {
        userAgent: USER_AGENT,
        timeoutMs: 10_000,
        maxRedirects: 10,
      }),
    );

    /* 2. Run scan tracks in parallel */
    const tracks = await step.run("run-scan-tracks", async () => {
      const [lh, dom, hdr] = await Promise.allSettled([
        runLighthouse(validatedUrl, ["performance", "seo", "best-practices"]),
        runDomChecks(validatedUrl),
        runHeaderChecks(validatedUrl),
      ]);

      const lighthouse = settleTrack("Lighthouse", lh, validatedUrl, logger);
      const domChecks = settleTrack("DOM checks", dom, validatedUrl, logger);
      const headers = settleTrack("Header checks", hdr, validatedUrl, logger);

      if (!lighthouse.value && !domChecks.value && !headers.value) {
        throw new Error("All scan tracks failed, no results to store");
      }

      return {
        lighthouse: lighthouse.value,
        dom: domChecks.value,
        headers: headers.value,
        errors: {
          lighthouse: lighthouse.error,
          dom: domChecks.error,
          headers: headers.error,
        },
      } satisfies TrackResults<
        Awaited<ReturnType<typeof runLighthouse>>,
        Awaited<ReturnType<typeof runDomChecks>>,
        Awaited<ReturnType<typeof runHeaderChecks>>
      >;
    });

    /* 3. Aggregate scores */
    const result = await step.run("aggregate", () =>
      aggregate(validatedUrl, {
        lighthouse: tracks.lighthouse,
        dom: tracks.dom,
        headers: tracks.headers,
        trackErrors: tracks.errors,
      }),
    );

    /* 4. Store scan */
    const { details } = result;
    const scan = await step.run("store", () =>
      createScan(db, {
        leadId,
        url: result.finalUrl,
        overallScore: result.overallScore,
        performanceScore: details.performance?.score ?? null,
        seoScore: details.seo?.score ?? null,
        accessibilityScore: details.accessibility?.score ?? null,
        legalScore: details.legal?.score ?? null,
        securityScore: details.security?.score ?? null,
        standardsScore: details.standards?.score ?? null,
        details,
      }),
    );

    /* 5. Send results email */
    await inngest.send({
      name: "scan.completed",
      data: {
        leadId,
        scanId: scan.id,
        url: result.finalUrl,
        locale,
        overallScore: result.overallScore,
        details,
      },
    });

    const durationMs = Date.now() - scanStartedAt;
    logger.info("Scan completed", { leadId, scanId: scan.id, overallScore: result.overallScore });
    Sentry.logger.info("Scan completed", {
      leadId,
      scanId: scan.id,
      url,
      overallScore: result.overallScore,
      durationMs,
    });

    return { scanId: scan.id, overallScore: result.overallScore };
  },
);
