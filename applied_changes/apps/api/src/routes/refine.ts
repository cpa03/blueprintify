import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { RefineRequestSchema } from '@blueprint/shared';
import { REFINER_SYSTEM_PROMPT, buildRefinePrompt } from '../services/prompts';
import { streamCompletion, type AIConfig } from '../services/openai';
import { createSSEResponse, createStreamFromGenerator } from '../utils/stream';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

app.post('/', zValidator('json', RefineRequestSchema), async (c) => {
  const request = c.req.valid('json');

  const config: AIConfig = {
    apiKey: c.env.OPENAI_API_KEY,
    baseURL: c.env.OPENAI_BASE_URL,
    model: c.env.OPENAI_MODEL
  };

  if (!config.apiKey) {
    return c.json({ error: 'OpenAI API key not configured' }, 500);
  }

  const userPrompt = buildRefinePrompt(request);

  const generator = streamCompletion({
    systemPrompt: REFINER_SYSTEM_PROMPT,
    userPrompt,
    config
  });

  const stream = createStreamFromGenerator(generator);
  return createSSEResponse(stream);
});

export default app;
