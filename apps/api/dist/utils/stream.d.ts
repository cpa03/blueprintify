/**
 * Server-Sent Events stream helper for Cloudflare Workers
 */
export interface SSEMessage {
    event?: string;
    data: string;
    id?: string;
}
/**
 * Formats a message for SSE
 */
export declare function formatSSE(message: SSEMessage): string;
/**
 * Creates an SSE response with proper headers
 */
export declare function createSSEResponse(stream: ReadableStream<Uint8Array>): Response;
/**
 * Creates a streaming response from an async generator
 */
export declare function createStreamFromGenerator(generator: AsyncGenerator<string, void, unknown>, onComplete?: () => void): ReadableStream<Uint8Array>;
