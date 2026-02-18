import { SSE_HEADERS } from "../config/constants";

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

export interface StreamUtils {
  createStreamFromGenerator: (
    generator: AsyncGenerator<string, void, unknown>,
    onComplete?: () => void,
  ) => ReadableStream<Uint8Array>;
  createSSEResponse: (stream: ReadableStream<Uint8Array>) => Response;
}

export interface Container {
  aiService: AIService;
  streamUtils: StreamUtils;
}

let defaultContainer: Container | null = null;

export function setDefaultContainer(container: Container): void {
  defaultContainer = container;
}

export function getContainer(): Container {
  if (!defaultContainer) {
    throw new Error(
      "DI Container not initialized. Call setDefaultContainer() before using services.",
    );
  }
  return defaultContainer;
}

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

export function resetContainer(): void {
  defaultContainer = null;
}
