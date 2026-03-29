import { createMiddleware } from "hono/factory";
import { createDb } from "@vivotiv/db";
import type { Database } from "@vivotiv/db";

import type { Env } from "../env";

let dbSingleton: Database | null = null;
let dbSingletonUrl: string | null = null;

export const dbMiddleware = createMiddleware<Env>(async (c, next) => {
  if (!dbSingleton || dbSingletonUrl !== c.env.DATABASE_URL) {
    dbSingleton = createDb(c.env.DATABASE_URL);
    dbSingletonUrl = c.env.DATABASE_URL;
  }

  const db = dbSingleton!;
  c.set("db", db);
  await next();
});
