/**
 * Logger - Structured frontend logging utility
 *
 * Centralizes all console output for consistency and environment-awareness.
 * In production, only error-level logs are emitted. Debug/warn are suppressed
 * unless explicitly configured or in development mode.
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

import { isDev } from "../config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Minimum log level for production builds.
 * Only levels >= this threshold will emit.
 */
const PRODUCTION_THRESHOLD: LogLevel = "warn";

function shouldLog(level: LogLevel): boolean {
  if (isDev()) return true;
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[PRODUCTION_THRESHOLD];
}

function prefix(level: LogLevel): string {
  const timestamp = new Date().toISOString().slice(11, 23);
  return `[${timestamp}] [${level.toUpperCase()}]`;
}

export const logger = {
  debug(message: string, ...args: unknown[]): void {
    if (!shouldLog("debug")) return;
    console.debug(`${prefix("debug")} ${message}`, ...args);
  },

  info(message: string, ...args: unknown[]): void {
    if (!shouldLog("info")) return;
    console.info(`${prefix("info")} ${message}`, ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    if (!shouldLog("warn")) return;
    console.warn(`${prefix("warn")} ${message}`, ...args);
  },

  error(message: string, ...args: unknown[]): void {
    if (!shouldLog("error")) return;
    console.error(`${prefix("error")} ${message}`, ...args);
  },
};

export default logger;
