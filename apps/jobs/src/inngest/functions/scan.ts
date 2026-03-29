import { createDb, createScan } from "@vivotiv/db";

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
    const { leadId, url } = event.data as { leadId: string; url: string };
    logger.info("Scan started", { leadId, url });

    const validatedUrl = await step.run("validate-dns-redirect-chain", () =>
      validatePublicRedirectChain(url, {
        userAgent: USER_AGENT,
        timeoutMs: 10_000,
        maxRedirects: 10,
      }),
    );

    // Assign step promises first, then await (Inngest parallel pattern)
    const lighthouseStep = step.run("run-lighthouse", () =>
      runLighthouse(validatedUrl, ["performance", "seo", "best-practices"]),
    );
    const domStep = step.run("run-dom-checks", () => runDomChecks(validatedUrl));
    const headersStep = step.run("run-header-checks", () =>
      runHeaderChecks(validatedUrl),
    );

    const [lighthouseResult, domResult, headersResult] =
      await Promise.allSettled([lighthouseStep, domStep, headersStep]);

    const lighthouse =
      lighthouseResult.status === "fulfilled" ? lighthouseResult.value : null;
    const dom =
      domResult.status === "fulfilled" ? domResult.value : null;
    const headers =
      headersResult.status === "fulfilled" ? headersResult.value : null;

    if (lighthouseResult.status === "rejected") {
      logger.error("Lighthouse track failed", {
        error: String(lighthouseResult.reason),
      });
    }
    if (domResult.status === "rejected") {
      logger.error("DOM checks track failed", {
        error: String(domResult.reason),
      });
    }
    if (headersResult.status === "rejected") {
      logger.error("Header checks track failed", {
        error: String(headersResult.reason),
      });
    }

    // All three tracks failed, nothing to store
    if (!lighthouse && !dom && !headers) {
      throw new Error("All scan tracks failed, no results to store");
    }

    const result = await step.run("aggregate", () =>
      aggregate(validatedUrl, {
        lighthouse,
        dom,
        headers,
        trackErrors: {
          lighthouse:
            lighthouseResult.status === "rejected"
              ? String(lighthouseResult.reason)
              : null,
          dom: domResult.status === "rejected" ? String(domResult.reason) : null,
          headers:
            headersResult.status === "rejected"
              ? String(headersResult.reason)
              : null,
        },
      }),
    );

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

    logger.info("Scan completed", {
      leadId,
      scanId: scan.id,
      overallScore: result.overallScore,
    });

    return { scanId: scan.id, overallScore: result.overallScore };
  },
);
