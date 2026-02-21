/**
 * Dependency Injection Module
 *
 * Provides container initialization for the Blueprint Generator API.
 * Sets up the default container with all required service dependencies.
 *
 * @module di
 */

import { setDefaultContainer, type Container } from "./container";
import { streamCompletion } from "../services/openai";
import { createStreamFromGenerator, createSSEResponse } from "../utils/stream";

/**
 * Initializes the dependency injection container with default service implementations.
 *
 * This function must be called during application startup to configure the
 * service container with the required dependencies for AI completion streaming
 * and SSE response handling.
 *
 * The container provides:
 * - `aiService.streamCompletion`: OpenAI streaming completion function
 * - `streamUtils.createStreamFromGenerator`: Converts async generators to ReadableStreams
 * - `streamUtils.createSSEResponse`: Creates SSE-formatted HTTP responses
 *
 * @example
 * ```typescript
 * // Call during app initialization
 * initializeContainer();
 *
 * // Later, services can be resolved from the container
 * const { aiService } = getContainer();
 * await aiService.streamCompletion(prompt, onChunk);
 * ```
 */
export function initializeContainer(): void {
  const container: Container = {
    aiService: {
      streamCompletion,
    },
    streamUtils: {
      createStreamFromGenerator,
      createSSEResponse,
    },
  };

  setDefaultContainer(container);
}
