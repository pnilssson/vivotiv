import { aggregate } from "../../scanner/aggregate";
import { runDomChecks } from "../../scanner/dom-checks";
import { runHeaderChecks } from "../../scanner/header-checks";
import { runLighthouse } from "../../scanner/lighthouse";
import { storeScanResult } from "../../scanner/store";
import { inngest } from "../client";

export const scanFunction = inngest.createFunction(
  { id: "scan-website", retries: 2 },
  { event: "scan.requested" },
  async ({ event, step, logger }) => {
    const { leadId, url } = event.data;
    logger.info("Scan started", { leadId, url });

    const [lighthouse, dom, headers] = await Promise.all([
      step.run("run-lighthouse", () =>
        runLighthouse(url, ["performance", "seo", "best-practices"]),
      ),
      step.run("run-dom-checks", () => runDomChecks(url)),
      step.run("run-header-checks", () => runHeaderChecks(url)),
    ]);

    const result = await step.run("aggregate", () =>
      aggregate(url, { lighthouse, dom, headers }),
    );

    const scan = await step.run("store", () =>
      storeScanResult({
        leadId,
        url: result.finalUrl,
        overallScore: result.overallScore,
        details: result.details,
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
