import { zValidator } from "@hono/zod-validator";
import { ScanSubmissionSchema } from "@vivotiv/shared";
import { Hono } from "hono";

import type { Env } from "../../env";
import { validationHook } from "../../middleware/validator";
import { submitScan } from "./service";

export const scanRoutes = new Hono<Env>().post(
  "/scan",
  zValidator("json", ScanSubmissionSchema, validationHook),
  async (c) => {
    const payload = c.req.valid("json");
    const result = await submitScan(c.var.db, payload);

    return c.json(result, 202);
  },
);
