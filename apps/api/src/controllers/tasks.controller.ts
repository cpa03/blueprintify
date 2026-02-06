import { streamCompletion } from "../services/openai";
import { BaseController } from "./base.controller";
import {
  TASK_SPLITTER_SYSTEM_PROMPT,
  buildTaskPrompt,
} from "../services/prompts";
import type { z } from "zod";
import type { TaskGenerationRequestSchema } from "@blueprint/shared";

export class TasksController extends BaseController {
  async generateTasks(c: any): Promise<Response> {
    const { blueprint, projectName } = c.get("validatedData") as z.infer<
      typeof TaskGenerationRequestSchema
    >;
    const config = this.createAIConfig(c);

    const userPrompt = buildTaskPrompt(blueprint, projectName);

    const generator = streamCompletion({
      systemPrompt: TASK_SPLITTER_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    return this.handleStreamingResponse(generator);
  }
}
