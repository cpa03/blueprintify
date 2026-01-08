import type { BlueprintRequest, TaskGenerationRequest, RefineRequest, StreamChunk } from '@blueprint/shared';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

interface StreamEventHandlers {
  onChunk: (content: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

/**
 * Parses SSE stream and calls appropriate handlers
 */
async function handleSSEStream(
  response: Response,
  handlers: StreamEventHandlers
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    handlers.onError('No response body');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const eventBlock of lines) {
        if (!eventBlock.trim()) continue;

        const dataMatch = eventBlock.match(/data: (.+)/);
        if (dataMatch && dataMatch[1]) {
          try {
            const parsed: StreamChunk = JSON.parse(dataMatch[1]);
            
            if (parsed.type === 'content' && parsed.content) {
              handlers.onChunk(parsed.content);
            } else if (parsed.type === 'error' && parsed.error) {
              handlers.onError(parsed.error);
            } else if (parsed.type === 'done') {
              handlers.onDone();
              return;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
    handlers.onDone();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stream error';
    handlers.onError(message);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Generate a blueprint document
 */
export async function generateBlueprint(
  request: BlueprintRequest,
  handlers: StreamEventHandlers
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      handlers.onError(error.error || 'Generation failed');
      return;
    }

    await handleSSEStream(response, handlers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    handlers.onError(message);
  }
}

/**
 * Generate tasks from a blueprint
 */
export async function generateTasks(
  request: TaskGenerationRequest,
  handlers: StreamEventHandlers
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      handlers.onError(error.error || 'Task generation failed');
      return;
    }

    await handleSSEStream(response, handlers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    handlers.onError(message);
  }
}

/**
 * Refine a section of content
 */
export async function refineContent(
  request: RefineRequest,
  handlers: StreamEventHandlers
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      handlers.onError(error.error || 'Refinement failed');
      return;
    }

    await handleSSEStream(response, handlers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    handlers.onError(message);
  }
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/`);
    return response.ok;
  } catch {
    return false;
  }
}
