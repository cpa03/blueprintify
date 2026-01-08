import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { BlueprintRequestSchema } from '@blueprint/shared';
import { ARCHITECT_SYSTEM_PROMPT, buildBlueprintPrompt } from '../services/prompts';
import { streamCompletion } from '../services/openai';
import { createSSEResponse, createStreamFromGenerator } from '../utils/stream';
const app = new Hono();
app.post('/', zValidator('json', BlueprintRequestSchema), async (c) => {
    const request = c.req.valid('json');
    const config = {
        apiKey: c.env.OPENAI_API_KEY,
        baseURL: c.env.OPENAI_BASE_URL,
        model: c.env.OPENAI_MODEL
    };
    if (!config.apiKey) {
        return c.json({ error: 'OpenAI API key not configured' }, 500);
    }
    const userPrompt = buildBlueprintPrompt(request);
    const generator = streamCompletion({
        systemPrompt: ARCHITECT_SYSTEM_PROMPT,
        userPrompt,
        config
    });
    const stream = createStreamFromGenerator(generator);
    return createSSEResponse(stream);
});
export default app;
