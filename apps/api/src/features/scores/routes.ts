import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";

import type { Env } from "../../env";
import { fetchAverageScores } from "./service";

export const scoresRoutes = new Hono<Env>().get(
  "/scores/averages",
  async (c) => {
    const scores = await fetchAverageScores(c.var.db, c.env.VIVOTIV_CACHE);

    Sentry.logger.info("Average scores fetched", {
      scanCount: scores.scanCount,
    });

    return c.json(scores, 200, {
      "Cache-Control": "public, max-age=1800",
    });
  },
);
