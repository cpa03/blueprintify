import { BaseController } from "./base.controller";
import { getContainer } from "../di/container";
import {
  ARCHITECT_SYSTEM_PROMPT,
  buildBlueprintPrompt,
} from "../services/prompts";
import type { BlueprintContext } from "../types";

export class GenerateController extends BaseController {
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
