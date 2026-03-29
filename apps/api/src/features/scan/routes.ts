import * as Sentry from "@sentry/cloudflare";
import { zValidator } from "@hono/zod-validator";
import { ScanSubmissionSchema } from "@vivotiv/shared";
import { Hono } from "hono";

import type { Env } from "../../env";
import { rateLimiter } from "../../middleware/rate-limit";
import { validationHook } from "../../middleware/validator";
import { submitScan } from "./service";

export const scanRoutes = new Hono<Env>().post(
  "/scan",
  rateLimiter("SCAN_RATE_LIMITER"),
  zValidator("json", ScanSubmissionSchema, validationHook),
  async (c) => {
    const payload = c.req.valid("json");
    const result = await submitScan(c.var.db, payload, c.env.INNGEST_EVENT_KEY);

    Sentry.logger.info("Scan submitted", { url: payload.url });
    c.var.posthog.capture({
      distinctId: payload.email,
      event: "scan_submitted",
      properties: { url: payload.url },
    });

    return c.json(result, 202);
  },
);
