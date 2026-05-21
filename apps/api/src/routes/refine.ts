/**
 * Refine Routes
 *
 * API endpoint for refining specific sections of generated content.
 * Delegates to RefineController for AI-assisted content enhancement
 * with SSE streaming for incremental response delivery.
 *
 * @module routes/refine
 */

import { Hono } from "hono";
import { RefineRequestSchema } from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { RefineController } from "../controllers";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();
const refineController = new RefineController();

app.post("/", rateLimit(rateLimitConfigs.strict), validateJson(RefineRequestSchema), async (c) => {
  return refineController.refineContent(c);
});

export default app;
