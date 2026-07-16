import { TaskGenerationRequestSchema } from "@blueprint/shared";
import { createPostRoute } from "../middleware/routeFactory";
import { TasksController } from "../controllers";
import { INJECTION_FIELD_DEFINITIONS } from "../config/constants";

const tasksController = new TasksController();

export default createPostRoute(
  TaskGenerationRequestSchema,
  async (c) => tasksController.generateTasks(c),
  INJECTION_FIELD_DEFINITIONS.TASKS
);
