import type { Context } from "hono";
import type { BlueprintRequest } from "@blueprint/shared";
import { ARCHITECT_SYSTEM_PROMPT, buildBlueprintPrompt } from "../prompts";
import { streamCompletion, type AIConfig } from "../openai";
import {
  createSSEResponse,
  createStreamFromGenerator,
} from "../../utils/stream";
import { ErrorCode, handleControllerError } from "../../utils/errors";
import type { Env } from "../../types";

/**
 * Controller for blueprint generation endpoint
 */
export class GenerateController {
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
   * Handles blueprint generation request
   */
  async generateBlueprint(
    c: Context<{ Bindings: Env }>,
    request: BlueprintRequest,
  ): Promise<Response> {
    try {
      // Create AI configuration
      const config = this.createAIConfig(c.env);

      // Build prompt
      const userPrompt = buildBlueprintPrompt(request);

      // Stream completion
      const generator = streamCompletion({
        systemPrompt: ARCHITECT_SYSTEM_PROMPT,
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
export const generateController = new GenerateController();
