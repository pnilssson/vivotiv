import * as Sentry from "@sentry/node";
import { createDb, createScan } from "@vivotiv/db";
import { type Locale, type ScanSource, DEFAULT_SCAN_SOURCE } from "@vivotiv/shared";

import { env } from "../../env";
import { runAiReadinessHttpChecks } from "../../scanner/ai-readiness-checks";
import { aggregate } from "../../scanner/aggregate";
import { runApiChecks } from "../../scanner/api-checks";
import { validatePublicRedirectChain } from "../../scanner/dns-validation";
import { runDomChecks } from "../../scanner/dom-checks";
import { runHeaderChecks } from "../../scanner/header-checks";
import { runLighthouse } from "../../scanner/lighthouse";
import { runLinkChecks } from "../../scanner/link-checks";
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
    onFailure: async ({ error, event }) => {
      const { leadId, url } = event.data.event.data as {
        leadId: string;
        url: string;
      };
      Sentry.captureException(error, {
        tags: { function: "scan-website" },
        extra: { leadId, url },
      });
      Sentry.logger.error("scan-website failed permanently", {
        leadId,
        url,
        error: String(error),
      });
    },
  },
  { event: "scan.requested" },
  async ({ event, step }) => {
    const { leadId, url, locale, source = DEFAULT_SCAN_SOURCE, businessName } = event.data as {
      leadId: string;
      url: string;
      locale: Locale;
      source?: ScanSource;
      businessName?: string;
    };
    const scanStartedAt = Date.now();
    Sentry.logger.info("Scan started", { leadId, url });

    /* 1. Validate URL */
    const validatedUrl = await step.run("validate-dns-redirect-chain", () =>
      validatePublicRedirectChain(url, {
        userAgent: USER_AGENT,
        timeoutMs: 10_000,
        maxRedirects: 10,
      }),
    );

    Sentry.logger.info("DNS validation completed", { leadId, url, validatedUrl });

    /* 2. Run scan tracks in parallel (each step retries independently) */
    const lighthousePromise = step
      .run("run-lighthouse", () =>
        runLighthouse(validatedUrl, ["performance", "seo", "best-practices"]),
      )
      .catch((err) => {
        Sentry.logger.warn("Lighthouse track failed", { leadId, url: validatedUrl, error: String(err) });
        return null;
      });

    const domPromise = step
      .run("run-dom-checks", () => runDomChecks(validatedUrl))
      .catch((err) => {
        Sentry.logger.warn("DOM checks track failed", { leadId, url: validatedUrl, error: String(err) });
        return null;
      });

    const headersPromise = step
      .run("run-header-checks", () => runHeaderChecks(validatedUrl))
      .catch((err) => {
        Sentry.logger.warn("Header checks track failed", { leadId, url: validatedUrl, error: String(err) });
        return null;
      });

    const apiPromise = step
      .run("run-api-checks", () =>
        runApiChecks(validatedUrl, {
          googleCloudApiKey: env.GOOGLE_CLOUD_API_KEY || undefined,
        }),
      )
      .catch((err) => {
        Sentry.logger.warn("API checks track failed", { leadId, url: validatedUrl, error: String(err) });
        return null;
      });

    const linksPromise = step
      .run("run-link-checks", () => runLinkChecks(validatedUrl))
      .catch((err) => {
        Sentry.logger.warn("Link checks track failed", { leadId, url: validatedUrl, error: String(err) });
        return null;
      });

    const aiReadinessHttpPromise = step
      .run("run-ai-readiness-http", () => runAiReadinessHttpChecks(validatedUrl))
      .catch((err) => {
        Sentry.logger.warn("AI readiness HTTP track failed", { leadId, url: validatedUrl, error: String(err) });
        return null;
      });

    const [lighthouse, dom, headers, api, links, aiReadinessHttp] = await Promise.all([
      lighthousePromise,
      domPromise,
      headersPromise,
      apiPromise,
      linksPromise,
      aiReadinessHttpPromise,
    ]);

    if (!lighthouse && !dom && !headers) {
      throw new Error("All scan tracks failed, no results to store");
    }

    Sentry.logger.info("Scan tracks completed", {
      leadId,
      lighthouse: !!lighthouse,
      dom: !!dom,
      headers: !!headers,
      api: !!api,
      links: !!links,
      aiReadinessHttp: !!aiReadinessHttp,
    });

    /* 3. Aggregate scores */
    const result = await step.run("aggregate", () =>
      aggregate(validatedUrl, {
        lighthouse,
        dom,
        headers,
        api: api ?? null,
        links: links ?? null,
        aiReadinessHttp: aiReadinessHttp ?? null,
        trackErrors: {
          lighthouse: lighthouse ? null : "Track failed after retries",
          dom: dom ? null : "Track failed after retries",
          headers: headers ? null : "Track failed after retries",
          aiReadinessHttp: aiReadinessHttp ? null : "Track failed after retries",
        },
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
        trustSecurityScore: details.trustSecurity?.score ?? null,
        standardsScore: details.standards?.score ?? null,
        aiReadinessScore: details.aiReadiness?.score ?? null,
        source,
        details,
      }),
    );

    Sentry.logger.info("Scan stored", { leadId, scanId: scan.id, overallScore: result.overallScore });

    /* 5. Notify - consumer fetches details from DB via scanId */
    await step.sendEvent("notify-scan-completed", {
      name: "scan.completed",
      data: { leadId, scanId: scan.id, locale, source, businessName },
    });

    const durationMs = Date.now() - scanStartedAt;
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
