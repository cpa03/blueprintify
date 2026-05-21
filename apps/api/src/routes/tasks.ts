/**
 * Tasks Routes
 *
 * API endpoint for generating project tasks from a blueprint.
 * Delegates to TasksController for AI-assisted task breakdown
 * with SSE streaming for incremental response delivery.
 *
 * @module routes/tasks
 */

import { Hono } from "hono";
import { TaskGenerationRequestSchema } from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { TasksController } from "../controllers";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();
const tasksController = new TasksController();

app.post(
  "/",
  rateLimit(rateLimitConfigs.strict),
  validateJson(TaskGenerationRequestSchema),
  async (c) => {
    return tasksController.generateTasks(c);
  }
);

export default app;
