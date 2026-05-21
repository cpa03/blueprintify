/**
 * Generate Routes
 *
 * API endpoint for generating project blueprints from user input.
 * Delegates to GenerateController for blueprint creation with AI assistance.
 * Uses SSE streaming to return generated content incrementally.
 *
 * @module routes/generate
 */

import { Hono } from "hono";
import { BlueprintRequestSchema } from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { GenerateController } from "../controllers";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();
const generateController = new GenerateController();

app.post(
  "/",
  rateLimit(rateLimitConfigs.strict),
  validateJson(BlueprintRequestSchema),
  async (c) => {
    return generateController.generateBlueprint(c);
  }
);

export default app;
