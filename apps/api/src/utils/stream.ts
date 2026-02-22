/**
 * SSE Stream Utilities
 * Provides Server-Sent Events streaming response creation
 * for real-time content delivery.
 */

import { formatSSE } from "@blueprint/shared";
import { SSE_HEADERS, CORS_CONFIG, SSE_CONFIG } from "../config/constants";

// Re-export for backward compatibility
export { formatSSE } from "@blueprint/shared";
export type { SSEMessage } from "@blueprint/shared";

/**
 * Creates an HTTP Response with SSE streaming headers
 * @param stream - ReadableStream containing SSE formatted data
 * @returns Response object configured for SSE streaming
 */
export function createSSEResponse(
  stream: ReadableStream<Uint8Array>,
): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": SSE_HEADERS.CONTENT_TYPE,
      "Cache-Control": SSE_HEADERS.CACHE_CONTROL,
      Connection: SSE_HEADERS.CONNECTION,
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": CORS_CONFIG.ORIGIN,
      "Access-Control-Allow-Methods": CORS_CONFIG.ALLOW_METHODS.join(", "),
      "Access-Control-Allow-Headers": CORS_CONFIG.ALLOW_HEADERS.join(", "),
    },
  });
}

/**
 * Creates a ReadableStream from an async generator with SSE formatting
 * @param generator - Async generator yielding content chunks
 * @param onComplete - Optional callback invoked when stream completes successfully
 * @returns ReadableStream formatted for SSE transmission
 */
export function createStreamFromGenerator(
  generator: AsyncGenerator<string, void, unknown>,
  onComplete?: () => void,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          const message = formatSSE({
            data: JSON.stringify({
              type: SSE_CONFIG.EVENT_TYPES.CONTENT,
              content: chunk,
            }),
          });
          controller.enqueue(encoder.encode(message));
        }

        const doneMessage = formatSSE({
          data: JSON.stringify({ type: SSE_CONFIG.EVENT_TYPES.DONE }),
        });
        controller.enqueue(encoder.encode(doneMessage));

        onComplete?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const errSSE = formatSSE({
          data: JSON.stringify({
            type: SSE_CONFIG.EVENT_TYPES.ERROR,
            error: errorMessage,
          }),
        });
        controller.enqueue(encoder.encode(errSSE));
      } finally {
        controller.close();
      }
    },
  });
}
