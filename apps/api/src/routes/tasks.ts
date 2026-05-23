/**
 * Tasks Routes
 *
 * API endpoint for generating project tasks from a blueprint.
 * Delegates to TasksController for AI-assisted task breakdown
 * with SSE streaming for incremental response delivery.
 *
 * @module routes/tasks
 */

import { TaskGenerationRequestSchema } from "@blueprint/shared";
import { createPostRoute } from "../middleware/routeFactory";
import { TasksController } from "../controllers";

const tasksController = new TasksController();

export default createPostRoute(TaskGenerationRequestSchema, async (c) =>
  tasksController.generateTasks(c)
);
