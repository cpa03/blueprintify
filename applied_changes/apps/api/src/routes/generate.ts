import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { BlueprintRequestSchema } from "@blueprint/shared";
import { generateController } from "../controllers/generate.controller";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.post("/", zValidator("json", BlueprintRequestSchema), async (c) => {
  const request = c.req.valid("json");
  return generateController.generateBlueprint(request, c);
});

export default app;
