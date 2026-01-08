import OpenAI from 'openai';
export interface AIConfig {
    apiKey: string;
    baseURL?: string;
    model?: string;
}
export interface StreamOptions {
    systemPrompt: string;
    userPrompt: string;
    config: AIConfig;
}
/**
 * Creates an OpenAI client configured for edge runtime
 */
export declare function createAIClient(config: AIConfig): OpenAI;
/**
 * Streams a chat completion response
 */
export declare function streamCompletion(options: StreamOptions): AsyncGenerator<string, void, unknown>;
/**
 * Non-streaming chat completion (for shorter responses)
 */
export declare function generateCompletion(options: StreamOptions): Promise<string>;
