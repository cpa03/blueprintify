import { Hono } from "hono";
import { BlueprintRequestSchema } from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { optionalApiKeyAuth } from "../middleware/auth";
import { auditLogger } from "../middleware/logging";
import { GenerateController } from "../controllers";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();
const generateController = new GenerateController();

app.post(
  "/",
  optionalApiKeyAuth,
  auditLogger("blueprint_generate"),
  validateJson(BlueprintRequestSchema),
  async (c) => {
    return generateController.generateBlueprint(c);
  },
);

export default app;
