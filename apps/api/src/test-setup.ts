import { setupTestConfig, MOCK_ENV } from "./test-utils";

// Initialize environment config before all tests
setupTestConfig(MOCK_ENV);

// Suppress expected unhandled rejections from error handler tests
// These are ConfigurationErrors thrown during tests that verify error handling
process.on("unhandledRejection", (reason: unknown) => {
  if (
    reason instanceof Error &&
    reason.message === "OpenAI API key not configured"
  ) {
    return;
  }
  throw reason;
});
