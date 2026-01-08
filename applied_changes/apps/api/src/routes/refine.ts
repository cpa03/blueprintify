import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { RefineRequestSchema } from "@blueprint/shared";
import { refineController } from "../controllers/refine.controller";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.post("/", zValidator("json", RefineRequestSchema), async (c) => {
  const request = c.req.valid("json");
  return refineController.refineContent(request, c);
});

export default app;
