import { BaseController } from "./base.controller";
import { getContainer } from "../di/container";
import { REFINER_SYSTEM_PROMPT, buildRefinePrompt } from "../services/prompts";
import type { RefineContext } from "../types";

export class RefineController extends BaseController {
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
