import { BlueprintRequestSchema } from "@blueprint/shared";
import { createPostRoute } from "../middleware/routeFactory";
import { GenerateController } from "../controllers";
import { INJECTION_FIELD_DEFINITIONS } from "../config/constants";

const generateController = new GenerateController();

export default createPostRoute(
  BlueprintRequestSchema,
  async (c) => generateController.generateBlueprint(c),
  INJECTION_FIELD_DEFINITIONS.GENERATE
);
