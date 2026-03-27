import { zValidator } from "@hono/zod-validator";
import { ScanSubmissionSchema } from "@vivotiv/shared";
import { Hono } from "hono";

import { acceptScanSubmission } from "./service";

export const scanRoutes = new Hono().post(
  "/scan",
  zValidator("json", ScanSubmissionSchema),
  (c) => {
    const payload = c.req.valid("json");
    const response = acceptScanSubmission(payload);

    return c.json(response, 202);
  },
);
