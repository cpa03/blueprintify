/**
 * SSE Stream Utilities
 * Provides Server-Sent Events formatting and streaming response creation
 * for real-time content delivery.
 */

import {
  API_HEADERS,
  SSE_HEADERS,
  CORS_CONFIG,
  SSE_CONFIG,
  SSE_CORS_HEADERS,
  ERROR_MESSAGES,
} from "../config/constants";

/**
 * Server-Sent Event message structure
 */
export interface SSEMessage {
  /** Optional event type name */
  event?: string;
  /** Event data payload */
  data: string;
  /** Optional event ID for replay tracking */
  id?: string;
}

/**
 * Formats a message into SSE protocol format
 * @param message - SSE message containing event, data, and optional id
 * @returns Formatted SSE string ready for transmission
 */
export function formatSSE(message: SSEMessage): string {
  let result = "";

  if (message.event) {
    result += `event: ${message.event}\n`;
  }
  if (message.id) {
    result += `id: ${message.id}\n`;
  }

  const lines = message.data.split("\n");
  for (const line of lines) {
    result += `data: ${line}\n`;
  }

  result += "\n";
  return result;
}

/**
 * Creates an HTTP Response with SSE streaming headers
 * @param stream - ReadableStream containing SSE formatted data
 * @returns Response object configured for SSE streaming
 */
export function createSSEResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      [API_HEADERS.CACHE_CONTROL.HEADER_NAME]: SSE_HEADERS.CACHE_CONTROL,
      [SSE_CORS_HEADERS.ACCESS_CONTROL_ALLOW_ORIGIN]: CORS_CONFIG.ORIGIN,
      [SSE_CORS_HEADERS.ACCESS_CONTROL_ALLOW_METHODS]: CORS_CONFIG.ALLOW_METHODS.join(", "),
      [SSE_CORS_HEADERS.ACCESS_CONTROL_ALLOW_HEADERS]: CORS_CONFIG.ALLOW_HEADERS.join(", "),
      [API_HEADERS.SSE.X_ACCEL_BUFFERING]: API_HEADERS.SSE.X_ACCEL_BUFFERING_NO,
      [API_HEADERS.CONTENT_TYPE]: SSE_HEADERS.CONTENT_TYPE,
      [API_HEADERS.CONNECTION]: SSE_HEADERS.CONNECTION,
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
  onComplete?: () => void
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
          error instanceof Error ? error.message : ERROR_MESSAGES.SSE_UNKNOWN_ERROR;
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
