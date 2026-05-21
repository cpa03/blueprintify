import { SSE_HEADERS } from "../config/constants";

/**
 * Interface for AI service implementations.
 * Defines the contract for streaming AI completions.
 */
export interface AIService {
  streamCompletion: (options: {
    systemPrompt: string;
    userPrompt: string;
    config: {
      apiKey: string;
      baseURL?: string;
      model?: string;
    };
  }) => AsyncGenerator<string, void, unknown>;
}

/**
 * Interface for stream utility implementations.
 * Provides methods for creating SSE streams and responses.
 */
export interface StreamUtils {
  createStreamFromGenerator: (
    generator: AsyncGenerator<string, void, unknown>,
    onComplete?: () => void
  ) => ReadableStream<Uint8Array>;
  createSSEResponse: (stream: ReadableStream<Uint8Array>) => Response;
}

/**
 * Dependency injection container interface.
 * Holds service instances for the application.
 */
export interface Container {
  aiService: AIService;
  streamUtils: StreamUtils;
}

let defaultContainer: Container | null = null;

/**
 * Sets the default container instance for the application.
 * @param container - The container instance to use globally
 */
export function setDefaultContainer(container: Container): void {
  defaultContainer = container;
}

/**
 * Retrieves the default container instance.
 * @returns The configured container instance
 * @throws {Error} When container has not been initialized
 */
export function getContainer(): Container {
  if (!defaultContainer) {
    throw new Error(
      "DI Container not initialized. Call setDefaultContainer() before using services."
    );
  }
  return defaultContainer;
}

/**
 * Creates a mock container for testing purposes.
 * @param overrides - Optional partial container to override default mocks
 * @returns A container with mock service implementations
 */
export function createMockContainer(overrides?: Partial<Container>): Container {
  const mockStream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("mock data"));
      controller.close();
    },
  });

  return {
    aiService: {
      streamCompletion: async function* () {
        yield "# Test Blueprint\n\n";
        yield "## Overview\n";
        yield "This is a test blueprint.\n";
      },
    },
    streamUtils: {
      createStreamFromGenerator: () => mockStream,
      createSSEResponse: () =>
        new Response(mockStream, {
          headers: {
            "Content-Type": SSE_HEADERS.CONTENT_TYPE,
            "Cache-Control": SSE_HEADERS.CACHE_CONTROL,
            Connection: SSE_HEADERS.CONNECTION,
          },
        }),
    },
    ...overrides,
  };
}

/**
 * Resets the default container to null.
 * Useful for cleanup between tests.
 */
export function resetContainer(): void {
  defaultContainer = null;
}
