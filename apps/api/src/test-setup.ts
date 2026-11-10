/**
 * Test Setup Configuration
 *
 * Initializes the test environment for API tests.
 * Sets up mock environment configuration and handles expected unhandled rejections
 * that occur during error handling tests.
 *
 * @module test-setup
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { TEST_SETUP_STRINGS } from "@blueprint/shared";
import { setupTestConfig, MOCK_ENV } from "./test-utils";
import { ERROR_MESSAGES } from "./config/constants";

// workerd's AsyncLocalStorage.disable() hard-throws, but vitest 5.1+ calls it as a
// Node-only perf optimization from its mock-factory runner. Swallowing it is safe:
// disable() only stops ALS bookkeeping and never changes store behavior.
const originalDisable = AsyncLocalStorage.prototype.disable;
AsyncLocalStorage.prototype.disable = function disable(this: AsyncLocalStorage<unknown>) {
  try {
    return originalDisable.call(this);
  } catch {
    return this;
  }
};

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
  console.warn(`${TEST_SETUP_STRINGS.UNHANDLED_REJECTION_PREFIX}Unhandled rejection: ${reasonStr}`);
});
