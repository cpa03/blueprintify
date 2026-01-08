import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { TaskGenerationRequestSchema } from "@blueprint/shared";
import { tasksController } from "../services/controllers/tasksController";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.post("/", zValidator("json", TaskGenerationRequestSchema), async (c) => {
  const request = c.req.valid("json");
  return tasksController.generateTasks(c, request);
});

export default app;
