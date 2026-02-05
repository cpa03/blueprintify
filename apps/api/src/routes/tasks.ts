import { Hono } from "hono";
import { TaskGenerationRequestSchema } from "@blueprint/shared";
import {
  TASK_SPLITTER_SYSTEM_PROMPT,
  buildTaskPrompt,
} from "../services/prompts";
import { streamCompletion, type AIConfig } from "../services/openai";
import { createSSEResponse, createStreamFromGenerator } from "../utils/stream";
import { ConfigurationError } from "../errors";
import { validateJson } from "../middleware/validator";
import type { Env } from "../types";
import type { TaskGenerationRequest } from "@blueprint/shared";

const app = new Hono<{ Bindings: Env }>();

app.post("/", validateJson(TaskGenerationRequestSchema), async (c) => {
  const { blueprint, projectName } = c.get(
    "validatedData",
  ) as TaskGenerationRequest;

  const apiKey = c.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ConfigurationError("OpenAI API key not configured");
  }

  const config: AIConfig = {
    apiKey,
    baseURL: c.env.OPENAI_BASE_URL,
    model: c.env.OPENAI_MODEL,
  };

  const userPrompt = buildTaskPrompt(blueprint, projectName);

  const generator = streamCompletion({
    systemPrompt: TASK_SPLITTER_SYSTEM_PROMPT,
    userPrompt,
    config,
  });

  const stream = createStreamFromGenerator(generator);
  return createSSEResponse(stream);
});

export default app;
