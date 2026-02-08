import { streamCompletion } from "../services/openai";
import { BaseController } from "./base.controller";
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

    const generator = streamCompletion({
      systemPrompt: TASK_SPLITTER_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    return this.handleStreamingResponse(generator);
  }
}
