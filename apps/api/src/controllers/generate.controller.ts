import { BaseController } from "./base.controller";
import { getContainer } from "../di/container";
import { ARCHITECT_SYSTEM_PROMPT, buildBlueprintPrompt } from "../services/prompts";
import type { BlueprintContext } from "../types";

/**
 * Controller for blueprint generation endpoints.
 * Handles the generation of project architecture documentation
 * using AI-powered content streaming.
 */
export class GenerateController extends BaseController {
  /**
   * Generates a project blueprint based on the validated request.
   * @param c - The Hono context containing the blueprint request
   * @returns Streaming response with generated blueprint content
   */
  async generateBlueprint(c: BlueprintContext): Promise<Response> {
    this.validateEnvironment(c);
    const request = this.getValidatedData(c);
    const config = this.createAIConfig(c);

    const userPrompt = buildBlueprintPrompt(request);

    const container = getContainer();
    const generator = container.aiService.streamCompletion({
      systemPrompt: ARCHITECT_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    return this.handleStreamingResponse(generator);
  }
}
