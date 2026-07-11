/**
 * Validation Configuration Constants
 * Source of truth for validation-related constants
 */

import { VALIDATION_LIMITS, VALIDATION_LABELS } from "@blueprint/shared/config";

export { VALIDATION_LIMITS, VALIDATION_LABELS };

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
  TECH_STACK_MIN: (min: number) =>
    `Please select at least ${min} ${min === 1 ? "technology" : "technologies"} to proceed.`,
} as const;

/**
 * Step info validation labels for the wizard project info step
 * Centralized source of truth for step-specific ValidationCheckmark aria-labels.
 * Flexy says: No hardcoded "Project name is valid" or "Description is valid" in StepInfo!
 */
export const STEP_INFO_LABELS = {
  PROJECT_NAME_VALID: "Project name is valid",
  PROJECT_NAME_INVALID: "Project name needs at least 3 characters",
  DESCRIPTION_VALID: "Description is valid",
  DESCRIPTION_INVALID: "Description needs at least 10 characters",
} as const;
