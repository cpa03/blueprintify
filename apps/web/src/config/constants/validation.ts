/**
 * Validation Configuration Constants
 * Source of truth for validation-related constants
 */

import { VALIDATION_LIMITS } from "@blueprint/shared";

export { VALIDATION_LIMITS };

// Form validation limits derived from shared config
export const FORM_LIMITS = {
  PROJECT_NAME: {
    MIN: VALIDATION_LIMITS.PROJECT_NAME.MIN,
    MAX: VALIDATION_LIMITS.PROJECT_NAME.MAX,
    WARNING_THRESHOLD: VALIDATION_LIMITS.PROJECT_NAME.WARNING_THRESHOLD,
  },
  DESCRIPTION: {
    MIN: VALIDATION_LIMITS.DESCRIPTION.MIN,
    MAX: VALIDATION_LIMITS.DESCRIPTION.MAX,
  },
  TARGET_AUDIENCE: {
    MAX: VALIDATION_LIMITS.TARGET_AUDIENCE.MAX,
  },
  CONSTRAINTS: {
    MAX: VALIDATION_LIMITS.CONSTRAINTS.MAX,
  },
  FEATURE: {
    MAX: VALIDATION_LIMITS.FEATURE.MAX,
    MAX_COUNT: VALIDATION_LIMITS.FEATURE.MAX_COUNT,
  },
} as const;

// Validation messages
export const VALIDATION_MESSAGES = {
  DESCRIPTION_MIN_LENGTH: (min: number) => `Description must be at least ${min} characters`,
  APPROACHING_CHARACTER_LIMIT: "Approaching character limit",
  CHARACTERS_NEEDED: (count: number) => `${count} more characters needed`,
} as const;
