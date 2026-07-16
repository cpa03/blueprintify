import { RefineRequestSchema } from "@blueprint/shared";
import { createPostRoute } from "../middleware/routeFactory";
import { RefineController } from "../controllers";
import { INJECTION_FIELD_DEFINITIONS } from "../config/constants";

const refineController = new RefineController();

export default createPostRoute(
  RefineRequestSchema,
  async (c) => refineController.refineContent(c),
  INJECTION_FIELD_DEFINITIONS.REFINE
);
