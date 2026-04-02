import * as Sentry from "@sentry/cloudflare";
import { zValidator } from "@hono/zod-validator";
import { OutreachSubmissionSchema } from "@vivotiv/shared";
import { Hono } from "hono";

import type { Env } from "../../env";
import { validationHook } from "../../middleware/validator";
import { submitOutreach } from "./service";

export const outreachRoutes = new Hono<Env>().post(
  "/admin/outreach",
  async (c, next) => {
    const apiKey = c.req.header("x-api-key");
    if (!apiKey) {
      return c.json({ error: { message: "Unauthorized" } }, 401);
    }

    const encoder = new TextEncoder();
    const a = encoder.encode(apiKey);
    const b = encoder.encode(c.env.ADMIN_API_KEY);
    const subtle = crypto.subtle as SubtleCrypto & {
      timingSafeEqual(a: ArrayBufferView, b: ArrayBufferView): boolean;
    };
    if (a.byteLength !== b.byteLength || !subtle.timingSafeEqual(a, b)) {
      return c.json({ error: { message: "Unauthorized" } }, 401);
    }

    await next();
  },
  zValidator("json", OutreachSubmissionSchema, validationHook),
  async (c) => {
    const payload = c.req.valid("json");
    const result = await submitOutreach(
      c.var.db,
      payload,
      c.env.INNGEST_EVENT_KEY,
      c.env.INNGEST_BASE_URL,
    );

    if (result.status === "skipped") {
      Sentry.logger.info("Outreach skipped", {
        url: payload.url,
        reason: result.reason,
      });
      return c.json(result, 200);
    }

    Sentry.logger.info("Outreach queued", {
      leadId: result.leadId,
      url: payload.url,
    });

    return c.json(result, 202);
  },
);
