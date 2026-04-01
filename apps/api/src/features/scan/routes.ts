import * as Sentry from "@sentry/cloudflare";
import { zValidator } from "@hono/zod-validator";
import { ScanSubmissionSchema } from "@vivotiv/shared";
import { Hono } from "hono";

import type { Env } from "../../env";
import { rateLimiter } from "../../middleware/rate-limit";
import { validationHook } from "../../middleware/validator";
import { fetchScan, submitScan } from "./service";

export const scanRoutes = new Hono<Env>()
  .post(
    "/scan",
    rateLimiter("SCAN_RATE_LIMITER"),
    zValidator("json", ScanSubmissionSchema, validationHook),
    async (c) => {
      const payload = c.req.valid("json");
      const result = await submitScan(
        c.var.db,
        payload,
        c.env.INNGEST_EVENT_KEY,
        c.env.INNGEST_BASE_URL,
      );

      Sentry.logger.info("Scan submitted", {
        leadId: result.leadId,
        url: payload.url,
      });
      c.var.posthog.capture({
        distinctId: payload.email,
        event: "scan_submitted",
        properties: { url: payload.url },
      });

      return c.json(result, 202);
    },
  )
  .get("/scans/:id", async (c) => {
    const scan = await fetchScan(c.var.db, c.env.VIVOTIV_CACHE, c.req.param("id"));

    if (!scan) {
      return c.json({ error: { message: "Scan not found" } }, 404);
    }

    Sentry.logger.info("Scan fetched", { scanId: scan.id });

    return c.json(scan, 200, {
      "Cache-Control": "public, max-age=86400",
    });
  });
