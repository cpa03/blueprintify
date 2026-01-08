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
export function formatSSE(message: SSEMessage): string {
  let result = '';
  
  if (message.event) {
    result += `event: ${message.event}\n`;
  }
  if (message.id) {
    result += `id: ${message.id}\n`;
  }
  
  // Handle multi-line data
  const lines = message.data.split('\n');
  for (const line of lines) {
    result += `data: ${line}\n`;
  }
  
  result += '\n';
  return result;
}

/**
 * Creates an SSE response with proper headers
 */
export function createSSEResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * Creates a streaming response from an async generator
 */
export function createStreamFromGenerator(
  generator: AsyncGenerator<string, void, unknown>,
  onComplete?: () => void
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          const message = formatSSE({ data: JSON.stringify({ type: 'content', content: chunk }) });
          controller.enqueue(encoder.encode(message));
        }
        
        // Send done event
        const doneMessage = formatSSE({ data: JSON.stringify({ type: 'done' }) });
        controller.enqueue(encoder.encode(doneMessage));
        
        onComplete?.();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errSSE = formatSSE({ data: JSON.stringify({ type: 'error', error: errorMessage }) });
        controller.enqueue(encoder.encode(errSSE));
      } finally {
        controller.close();
      }
    }
  });
}
