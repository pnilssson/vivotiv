import { aggregate } from "../../scanner/aggregate";
import { runLighthouse } from "../../scanner/lighthouse";
import { storeScanResult } from "../../scanner/store";
import { inngest } from "../client";

export const scanFunction = inngest.createFunction(
  { id: "scan-website", retries: 2 },
  { event: "scan.requested" },
  async ({ event, step, logger }) => {
    const { leadId, url } = event.data;
    logger.info("Scan started", { leadId, url });

    const [lighthouse] = await Promise.all([
      step.run("run-lighthouse", () => runLighthouse(url, ["performance"])),
      // step.run("run-dom-checks", ...) -- added with scans 3-6
      // step.run("run-header-checks", ...) -- added with security scan
    ]);

    const result = await step.run("aggregate", () =>
      aggregate(url, { lighthouse }),
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
