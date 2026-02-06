import { streamCompletion } from "../services/openai";
import { BaseController } from "./base.controller";
import { REFINER_SYSTEM_PROMPT, buildRefinePrompt } from "../services/prompts";
import type { RefineContext } from "../types";

export class RefineController extends BaseController {
  async refineContent(c: RefineContext): Promise<Response> {
    const request = c.get("validatedData");
    const config = this.createAIConfig(c);

    const userPrompt = buildRefinePrompt(request);

    const generator = streamCompletion({
      systemPrompt: REFINER_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    return this.handleStreamingResponse(generator);
  }
}
