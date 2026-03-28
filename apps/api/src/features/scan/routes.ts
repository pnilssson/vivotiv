import { zValidator } from "@hono/zod-validator";
import { ScanSubmissionSchema } from "@vivotiv/shared";
import { Hono } from "hono";

import type { Env } from "../../env";
import { validationHook } from "../../middleware/validator";
import { createLead } from "./service";

export const scanRoutes = new Hono<Env>().post(
  "/scan",
  zValidator("json", ScanSubmissionSchema, validationHook),
  async (c) => {
    const payload = c.req.valid("json");
    const lead = await createLead(c.var.db, payload);

    return c.json(lead, 202);
  },
);
