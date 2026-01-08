import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { TaskGenerationRequestSchema } from '@blueprint/shared';
import { TASK_SPLITTER_SYSTEM_PROMPT, buildTaskPrompt } from '../services/prompts';
import { streamCompletion, type AIConfig } from '../services/openai';
import { createSSEResponse, createStreamFromGenerator } from '../utils/stream';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.post('/', zValidator('json', TaskGenerationRequestSchema), async (c) => {
  const { blueprint, projectName } = c.req.valid('json');

  const config: AIConfig = {
    apiKey: c.env.OPENAI_API_KEY,
    baseURL: c.env.OPENAI_BASE_URL,
    model: c.env.OPENAI_MODEL
  };

  if (!config.apiKey) {
    return c.json({ error: 'OpenAI API key not configured' }, 500);
  }

  const userPrompt = buildTaskPrompt(blueprint, projectName);

  const generator = streamCompletion({
    systemPrompt: TASK_SPLITTER_SYSTEM_PROMPT,
    userPrompt,
    config
  });

  const stream = createStreamFromGenerator(generator);
  return createSSEResponse(stream);
});

export default app;
