/**
 * Environment Configuration State
 *
 * Shared mutable state for environment configuration getters.
 * Must be initialized during app startup via setEnvConfig().
 *
 * @module config/constants/env
 */

import type { EnvConfig } from "../config-types";

let envConfig: EnvConfig | null = null;

/**
 * Sets the environment configuration for use by constant getters.
 * Must be called during application initialization.
 *
 * @param config - Environment configuration object or null to reset
 */
export function setEnvConfig(config: EnvConfig | null): void {
  envConfig = config;
}

/**
 * Gets the current environment configuration.
 *
 * @returns The environment configuration object
 * @throws Error if configuration has not been set
 */
export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    throw new Error(
      "Environment config not set. Call setEnvConfig() first during application initialization. This typically happens automatically in the main entry point (index.ts)."
    );
  }
  return envConfig;
}
