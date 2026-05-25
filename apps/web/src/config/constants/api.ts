/**
 * API Configuration Constants
 * Source of truth for API-related constants
 */

import { ENV } from "../env";
import { ROUTE_PATHS, RETRYABLE_STATUS_CODES, SSE_CONFIG, HTTP_STATUS } from "@blueprint/shared";

export { ROUTE_PATHS, RETRYABLE_STATUS_CODES, SSE_CONFIG, HTTP_STATUS };

/** API endpoints for the Blueprintify backend */
export const API_ENDPOINTS = {
  HEALTH: ROUTE_PATHS.ROOT,
  GENERATE: ROUTE_PATHS.GENERATE,
  TASKS: ROUTE_PATHS.TASKS,
  REFINE: ROUTE_PATHS.REFINE,
  EXPORT: ROUTE_PATHS.EXPORT,
  IMPORT: ROUTE_PATHS.IMPORT,
  STORAGE: ROUTE_PATHS.STORAGE,
  SHARE: ROUTE_PATHS.SHARE,
} as const;

/**
 * API Error Messages
 * Displayed to users when API calls fail
 */
export const API_ERROR_MESSAGES = {
  GENERATION_FAILED: "Generation failed. Please check your input and try again.",
  TASK_GENERATION_FAILED: "Task generation failed. Ensure blueprint content is valid.",
  REFINEMENT_FAILED: "Refinement failed. Please check your refinement instructions.",
  NO_RESPONSE_BODY: "Server returned empty response. Check if API server is running.",
  STREAM_ERROR: "Connection interrupted. Check your network and try again.",
} as const;

/** Generation timing estimates */
export const GENERATION_ESTIMATES = {
  TYPICAL_DURATION_SECONDS: "30-60",
  SHORT: "15-30",
  LONG: "60-90",
} as const;

/** Generation progress messages */
export const GENERATION_MESSAGES = {
  CANCELLED: "Generation cancelled",
  BLUEPRINT_START: "Generating blueprint...",
  BLUEPRINT_COMPLETE: "Blueprint complete. Generating tasks...",
  COMPLETE: "Complete!",
  RETRY: (attempt: number, maxRetries: number) =>
    `Connection issue, retrying (${attempt}/${maxRetries})...`,
  ERROR: (error: string) => `Error: ${error}`,
  ERROR_TASKS: (error: string) => `Error generating tasks: ${error}`,
} as const;

/** External URLs used throughout the application */
export const EXTERNAL_URLS = {
  GITHUB: ENV.GITHUB_URL,
  PROJECT_HOMEPAGE: ENV.PROJECT_HOMEPAGE_URL,
};

/**
 * Vercel deployment detection hostnames
 * Flexy says: No hardcoded hostnames - everything in config!
 */
export const VERCEL_DOMAINS = {
  LOCAL: ["localhost", "127.0.0.1"] as readonly string[],
};

/** Frontend-specific error messages (supplemental) */
export const FRONTEND_ERROR_MESSAGES = {
  UNKNOWN_ERROR: "Unknown error",
} as const;
