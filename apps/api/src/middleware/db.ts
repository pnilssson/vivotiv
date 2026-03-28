import { createMiddleware } from "hono/factory";
import { createDb } from "@vivotiv/db";

import type { Env } from "../env";

export const dbMiddleware = createMiddleware<Env>(async (c, next) => {
  const db = createDb(c.env.DATABASE_URL);
  c.set("db", db);
  await next();
});
