import type { Context } from "hono";
import type { TaskGenerationRequest } from "@blueprint/shared";
import { TASK_SPLITTER_SYSTEM_PROMPT, buildTaskPrompt } from "../prompts";
import { streamCompletion, type AIConfig } from "../openai";
import {
  createSSEResponse,
  createStreamFromGenerator,
} from "../../utils/stream";
import { ErrorCode, handleControllerError } from "../../utils/errors";
import type { Env } from "../../types";

/**
 * Controller for task generation endpoint
 */
export class TasksController {
  /**
   * Validates and creates AI configuration from environment
   */
  private createAIConfig(env: Env): AIConfig {
    // Simple validation for required keys
    if (!env.OPENAI_API_KEY) {
      throw new Error("Missing required environment variable: OPENAI_API_KEY");
    }

    return {
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL,
      model: env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }

  /**
   * Handles task generation request
   */
  async generateTasks(
    c: Context<{ Bindings: Env }>,
    request: TaskGenerationRequest,
  ): Promise<Response> {
    try {
      // Create AI configuration
      const config = this.createAIConfig(c.env);

      // Build prompt
      const userPrompt = buildTaskPrompt(
        request.blueprint,
        request.projectName,
      );

      // Stream completion
      const generator = streamCompletion({
        systemPrompt: TASK_SPLITTER_SYSTEM_PROMPT,
        userPrompt,
        config,
      });

      // Convert to SSE stream
      const stream = createStreamFromGenerator(generator);
      return createSSEResponse(stream);
    } catch (error) {
      return handleControllerError(error, c, ErrorCode.GENERATION_FAILED);
    }
  }
}

// Export singleton instance for use in routes
export const tasksController = new TasksController();
