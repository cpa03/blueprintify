import { streamCompletion } from "../services/openai";
import { BaseController } from "./base.controller";
import { REFINER_SYSTEM_PROMPT, buildRefinePrompt } from "../services/prompts";
import type { z } from "zod";
import type { RefineRequestSchema } from "@blueprint/shared";

export class RefineController extends BaseController {
  async refineContent(c: any): Promise<Response> {
    const request = c.get("validatedData") as z.infer<
      typeof RefineRequestSchema
    >;
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
