import { setDefaultContainer, type Container } from "./container";
import { streamCompletion } from "../services/openai";
import { createStreamFromGenerator, createSSEResponse } from "../utils/stream";

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
