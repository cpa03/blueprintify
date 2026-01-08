import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { TaskGenerationRequestSchema } from "@blueprint/shared";
import { tasksController } from "../controllers/tasks.controller";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /tasks
 * Generates a task breakdown based on blueprint content
 */
app.post("/", zValidator("json", TaskGenerationRequestSchema), async (c) => {
  const request = c.req.valid("json");
  return tasksController.generateTasks(request, c);
});

export default app;
