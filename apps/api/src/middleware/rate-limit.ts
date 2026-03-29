import { createMiddleware } from "hono/factory";

import type { Env } from "../env";

export function rateLimiter(binding: keyof Env["Bindings"]) {
  return createMiddleware<Env>(async (c, next) => {
    const limiter = c.env[binding] as RateLimit;
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const { success } = await limiter.limit({ key: ip });

    if (!success) {
      return c.json({ error: { message: "Too many requests" } }, 429);
    }

    await next();
  });
}
