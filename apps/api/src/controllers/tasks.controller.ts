import { BaseController } from "./base.controller";
import { getContainer } from "../di/container";
import {
  TASK_SPLITTER_SYSTEM_PROMPT,
  buildTaskPrompt,
} from "../services/prompts";
import type { TasksContext } from "../types";

/**
 * Controller for task generation endpoints.
 * Handles the generation of prioritized task lists from
 * blueprint content using AI-powered content streaming.
 */
export class TasksController extends BaseController {
  /**
   * Generates a task list from a blueprint.
   * @param c - The Hono context containing the task generation request
   * @returns Streaming response with generated task content
   */
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
