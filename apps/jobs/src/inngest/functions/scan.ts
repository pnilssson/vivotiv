import { inngest } from "../client";

export const scanFunction = inngest.createFunction(
  { id: "scan-website" },
  { event: "scan.requested" },
  async ({ event, logger }) => {
    logger.info("Scan requested", {
      leadId: event.data.leadId,
      url: event.data.url,
    });

    // TODO: Implement scan pipeline steps
    // step.run("validate-url", ...)
    // step.run("lighthouse", ...)
    // step.run("axe-core", ...)
    // step.run("custom-checks", ...)
    // step.run("aggregate-scores", ...)
    // step.run("store-results", ...)
    // step.run("send-email", ...)

    return { status: "placeholder", leadId: event.data.leadId };
  },
);
