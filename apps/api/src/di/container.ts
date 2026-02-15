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
  createStreamFromGenerator: <T>(
    generator: AsyncGenerator<T, void, unknown>,
  ) => ReadableStream<T>;
  createSSEResponse: (stream: ReadableStream) => Response;
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
  const mockStream = new ReadableStream({
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
      createStreamFromGenerator: <T>() => mockStream as ReadableStream<T>,
      createSSEResponse: () =>
        new Response(mockStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        }),
    },
    ...overrides,
  };
}

export function resetContainer(): void {
  defaultContainer = null;
}
