/**
 * Generate Routes
 *
 * API endpoint for generating project blueprints from user input.
 * Delegates to GenerateController for blueprint creation with AI assistance.
 * Uses SSE streaming to return generated content incrementally.
 *
 * @module routes/generate
 */

import { BlueprintRequestSchema } from "@blueprint/shared";
import { createPostRoute } from "../middleware/routeFactory";
import { GenerateController } from "../controllers";

const generateController = new GenerateController();

export default createPostRoute(BlueprintRequestSchema, async (c) =>
  generateController.generateBlueprint(c)
);
