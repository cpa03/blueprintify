import { BaseController } from "./base.controller";
import { getContainer } from "../di/container";
import {
  TASK_SPLITTER_SYSTEM_PROMPT,
  buildTaskPrompt,
} from "../services/prompts";
import type { TasksContext } from "../types";

export class TasksController extends BaseController {
  async generateTasks(c: TasksContext): Promise<Response> {
    this.validateEnvironment(c);
    const { blueprint, projectName } = this.getValidatedData(c);
    const config = this.createAIConfig(c);

    const userPrompt = buildTaskPrompt(blueprint, projectName);

    const container = getContainer();
    const generator = container.aiService.streamCompletion({
      systemPrompt: TASK_SPLITTER_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    return this.handleStreamingResponse(generator);
  }
}
