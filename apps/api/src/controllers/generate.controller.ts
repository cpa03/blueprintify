import { streamCompletion } from "../services/openai";
import { BaseController } from "./base.controller";
import {
  ARCHITECT_SYSTEM_PROMPT,
  buildBlueprintPrompt,
} from "../services/prompts";
import type { z } from "zod";
import type { BlueprintRequestSchema } from "@blueprint/shared";

export class GenerateController extends BaseController {
  async generateBlueprint(c: any): Promise<Response> {
    const request = c.get("validatedData") as z.infer<
      typeof BlueprintRequestSchema
    >;
    const config = this.createAIConfig(c);

    const userPrompt = buildBlueprintPrompt(request);

    const generator = streamCompletion({
      systemPrompt: ARCHITECT_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    return this.handleStreamingResponse(generator);
  }
}
