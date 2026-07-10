/**
 * Logger - Structured frontend logging utility
 *
 * Centralizes all console output for consistency and environment-awareness.
 * In production, only error-level logs are emitted. Debug/warn are suppressed
 * unless explicitly configured or in development mode.
 *
 * Flexy says: No hardcoded "debug" | "info" | "warn" | "error" — uses LOG_LEVELS from shared!
 *
 * @example
 * ```typescript
 * import { logger } from "../utils/logger";
 * logger.error("Failed to load resource", err);
 * logger.warn("Storage quota nearing limit", { used, quota });
 * logger.info("Blueprint generation started");
 * logger.debug("Stream chunk received", chunk); // dev-only
 * ```
 */

import { LOG_LEVELS, LOG_TIMESTAMP_SLICE } from "@blueprint/shared";
import { isDev } from "../config/env";

type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LOG_LEVELS.DEBUG]: 0,
  [LOG_LEVELS.INFO]: 1,
  [LOG_LEVELS.WARN]: 2,
  [LOG_LEVELS.ERROR]: 3,
};

/**
 * Minimum log level for production builds.
 * Only levels >= this threshold will emit.
 */
const PRODUCTION_THRESHOLD: LogLevel = LOG_LEVELS.WARN;

function shouldLog(level: LogLevel): boolean {
  if (isDev()) return true;
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[PRODUCTION_THRESHOLD];
}

function prefix(level: LogLevel): string {
  const timestamp = new Date()
    .toISOString()
    .slice(LOG_TIMESTAMP_SLICE.START, LOG_TIMESTAMP_SLICE.END);
  return `[${timestamp}] [${level.toUpperCase()}]`;
}

export const logger = {
  debug(message: string, ...args: unknown[]): void {
    if (!shouldLog(LOG_LEVELS.DEBUG)) return;
    console.debug(`${prefix(LOG_LEVELS.DEBUG)} ${message}`, ...args);
  },

  info(message: string, ...args: unknown[]): void {
    if (!shouldLog(LOG_LEVELS.INFO)) return;
    console.log(`${prefix(LOG_LEVELS.INFO)} ${message}`, ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    if (!shouldLog(LOG_LEVELS.WARN)) return;
    console.warn(`${prefix(LOG_LEVELS.WARN)} ${message}`, ...args);
  },

  error(message: string, ...args: unknown[]): void {
    if (!shouldLog(LOG_LEVELS.ERROR)) return;
    console.error(`${prefix(LOG_LEVELS.ERROR)} ${message}`, ...args);
  },
};

export default logger;
