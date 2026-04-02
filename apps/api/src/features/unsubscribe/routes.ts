import * as Sentry from "@sentry/cloudflare";
import { unsubscribeLead } from "@vivotiv/db";
import { Hono } from "hono";

import type { Env } from "../../env";
import { verifyUnsubscribeToken } from "./token";

export const unsubscribeRoutes = new Hono<Env>().post(
  "/unsubscribe",
  async (c) => {
    const { token } = await c.req.json<{ token: string }>();
    if (!token) {
      return c.json({ error: { message: "Missing token" } }, 400);
    }

    const leadId = await verifyUnsubscribeToken(token, c.env.UNSUBSCRIBE_SECRET);
    if (!leadId) {
      return c.json({ error: { message: "Invalid token" } }, 400);
    }

    await unsubscribeLead(c.var.db, leadId);

    Sentry.logger.info("Lead unsubscribed", { leadId });

    return c.json({ success: true });
  },
);
