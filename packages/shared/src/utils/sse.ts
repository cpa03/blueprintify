/**
 * SSE Stream Utilities
 * Shared Server-Sent Events formatting utilities for frontend and backend.
 */

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
