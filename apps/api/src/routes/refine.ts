import { Hono } from "hono";
import { RefineRequestSchema } from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { optionalApiKeyAuth } from "../middleware/auth";
import { auditLogger } from "../middleware/logging";
import { RefineController } from "../controllers";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();
const refineController = new RefineController();

app.post(
  "/",
  optionalApiKeyAuth,
  auditLogger("content_refine"),
  validateJson(RefineRequestSchema),
  async (c) => {
    return refineController.refineContent(c);
  },
);

export default app;
