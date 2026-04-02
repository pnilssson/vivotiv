import * as Sentry from "@sentry/cloudflare";
import { unsubscribeLead } from "@vivotiv/db";
import { zValidator } from "@hono/zod-validator";
import { UnsubscribeSchema } from "@vivotiv/shared";
import { Hono } from "hono";

import type { Env } from "../../env";
import { validationHook } from "../../middleware/validator";
import { verifyUnsubscribeToken } from "./token";

export const unsubscribeRoutes = new Hono<Env>().post(
  "/unsubscribe",
  zValidator("json", UnsubscribeSchema, validationHook),
  async (c) => {
    const { token } = c.req.valid("json");

    const leadId = await verifyUnsubscribeToken(token, c.env.UNSUBSCRIBE_SECRET);
    if (!leadId) {
      return c.json({ error: { message: "Invalid token" } }, 400);
    }

    await unsubscribeLead(c.var.db, leadId);

    Sentry.logger.info("Lead unsubscribed", { leadId });

    return c.json({ success: true });
  },
);
