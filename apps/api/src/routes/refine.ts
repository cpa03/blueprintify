/**
 * Refine Routes
 *
 * API endpoint for refining specific sections of generated content.
 * Delegates to RefineController for AI-assisted content enhancement
 * with SSE streaming for incremental response delivery.
 *
 * @module routes/refine
 */

import { RefineRequestSchema } from "@blueprint/shared";
import { createPostRoute } from "../middleware/routeFactory";
import { RefineController } from "../controllers";

const refineController = new RefineController();

export default createPostRoute(
  RefineRequestSchema,
  async (c) => refineController.refineContent(c),
  [
    { path: "content", label: "content" },
    { path: "instruction", label: "instruction" },
    { path: "context", label: "context" },
  ]
);
