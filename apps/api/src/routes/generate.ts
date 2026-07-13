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

export default createPostRoute(
  BlueprintRequestSchema,
  async (c) => generateController.generateBlueprint(c),
  [
    { path: "projectName", label: "project name" },
    { path: "description", label: "description" },
    { path: "targetAudience", label: "target audience" },
    { path: "constraints", label: "constraints" },
    { path: "features", label: "features" },
    { path: "techStack", label: "tech stack" },
  ]
);
