/**
 * Refine Controller
 * Handles business logic for content refinement endpoint
 */

import type { RefineRequest } from "@blueprint/shared";
import { REFINER_SYSTEM_PROMPT, buildRefinePrompt } from "../services/prompts";
import { streamCompletion, type AIConfig } from "../services/openai";
import {
  createOpenAIConfigError,
  wrapOpenAIError,
  wrapStreamError,
} from "../lib/errors";
import { createSSEResponse, createStreamFromGenerator } from "../utils/stream";
import type { Context } from "hono";
import type { Env } from "../types";

/**
 * Validates OpenAI configuration
 */
function validateAIConfig(config: AIConfig): void {
  if (!config.apiKey) {
    throw createOpenAIConfigError();
  }
}

/**
 * Refines content based on user instruction using AI
 *
 * @param request - The validated refine request
 * @param c - Hono context with environment bindings
 * @returns SSE stream response
 */
export async function refineContent(
  request: RefineRequest,
  c: Context<{ Bindings: Env }>,
): Promise<Response> {
  try {
    // Extract and validate AI configuration
    const config: AIConfig = {
      apiKey: c.env.OPENAI_API_KEY,
      baseURL: c.env.OPENAI_BASE_URL,
      model: c.env.OPENAI_MODEL,
    };

    validateAIConfig(config);

    // Build prompt for AI service
    const userPrompt = buildRefinePrompt(request);

    // Create stream generator
    const generator = streamCompletion({
      systemPrompt: REFINER_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    // Wrap in SSE response
    const stream = createStreamFromGenerator(generator);
    return createSSEResponse(stream);
  } catch (error) {
    // Wrap known errors or create new ones
    if (
      error instanceof Error &&
      error.message === "OpenAI API key not configured"
    ) {
      throw wrapOpenAIError(error);
    }

    throw wrapStreamError(error);
  }
}

/**
 * Controller export for route handler integration
 */
export const refineController = {
  refineContent,
};
