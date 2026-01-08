import type { Context } from "hono";
import type { RefineRequest } from "@blueprint/shared";
import { REFINER_SYSTEM_PROMPT, buildRefinePrompt } from "../prompts";
import { streamCompletion, type AIConfig } from "../openai";
import {
  createSSEResponse,
  createStreamFromGenerator,
} from "../../utils/stream";
import { ErrorCode, handleControllerError } from "../../utils/errors";
import type { Env } from "../../types";

/**
 * Controller for content refinement endpoint
 */
export class RefineController {
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
   * Handles content refinement request
   */
  async refineContent(
    c: Context<{ Bindings: Env }>,
    request: RefineRequest,
  ): Promise<Response> {
    try {
      // Create AI configuration
      const config = this.createAIConfig(c.env);

      // Build prompt
      const userPrompt = buildRefinePrompt(request);

      // Stream completion
      const generator = streamCompletion({
        systemPrompt: REFINER_SYSTEM_PROMPT,
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
export const refineController = new RefineController();
