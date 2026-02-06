import { Hono } from "hono";
import { TaskGenerationRequestSchema } from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { optionalApiKeyAuth } from "../middleware/auth";
import { auditLogger } from "../middleware/logging";
import { TasksController } from "../controllers";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();
const tasksController = new TasksController();

app.post(
  "/",
  optionalApiKeyAuth,
  auditLogger("task_generate"),
  validateJson(TaskGenerationRequestSchema),
  async (c) => {
    return tasksController.generateTasks(c);
  },
);

export default app;
