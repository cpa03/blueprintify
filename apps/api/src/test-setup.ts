/**
 * Test Setup Configuration
 *
 * Initializes the test environment for API tests.
 * Sets up mock environment configuration and handles expected unhandled rejections
 * that occur during error handling tests.
 *
 * @module test-setup
 */
import { setupTestConfig, MOCK_ENV } from "./test-utils";
import { ERROR_MESSAGES } from "./config/constants";

// Initialize environment config before all tests
setupTestConfig(MOCK_ENV);

// Suppress expected unhandled rejections from error handler tests
// These are ConfigurationErrors thrown during tests that verify error handling
process.on("unhandledRejection", (reason: unknown) => {
  if (reason instanceof Error && reason.message === ERROR_MESSAGES.CONFIGURATION) {
    return;
  }
  // Log unexpected rejections instead of re-throwing to prevent
  // recursive unhandledRejection loops. Vitest already tracks and
  // fails tests on unhandled rejections during test execution.
  const reasonStr = reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
  console.warn(`[test-setup] Unhandled rejection: ${reasonStr}`);
});
