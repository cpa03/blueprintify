import { BaseController } from "./base.controller";
import { getContainer } from "../di/container";
import { REFINER_SYSTEM_PROMPT, buildRefinePrompt } from "../services/prompts";
import type { RefineContext } from "../types";

/**
 * Controller for content refinement endpoints.
 * Handles AI-powered refinement of specific blueprint sections
 * based on user instructions.
 */
export class RefineController extends BaseController {
  /**
   * Refines content based on user instructions.
   * @param c - The Hono context containing the refine request
   * @returns Streaming response with refined content
   */
  async refineContent(c: RefineContext): Promise<Response> {
    this.validateEnvironment(c);
    const request = this.getValidatedData(c);
    const config = this.createAIConfig(c);

    const userPrompt = buildRefinePrompt(request);

    const container = getContainer();
    const generator = container.aiService.streamCompletion({
      systemPrompt: REFINER_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    return this.handleStreamingResponse(generator);
  }
}
