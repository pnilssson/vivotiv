import { createMiddleware } from "hono/factory";
import { PostHog } from "posthog-node";

import type { Env } from "../env";

export const posthogMiddleware = createMiddleware<Env>(async (c, next) => {
  const posthog = new PostHog(c.env.POSTHOG_KEY, {
    host: "https://eu.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });

  c.set("posthog", posthog);

  await next();

  await posthog.shutdown();
});
