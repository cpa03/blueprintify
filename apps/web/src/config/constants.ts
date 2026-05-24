/**
 * Frontend Configuration Constants
 *
 * Flexy says: This file is now a re-export hub!
 * Each constant is defined in its own module under config/constants/.
 * Import directly from the specific module for tree-shaking,
 * or from this index for convenience.
 *
 * @example
 * ```typescript
 * // Import from specific module (preferred)
 * import { TIMEOUTS } from "../config/constants/storage";
 *
 * // Import from index (convenience - same as before)
 * import { TIMEOUTS } from "../config/constants";
 * ```
 */

// Re-export from modular source-of-truth files

// Security error messages live in config/security.ts
export { SECURITY_ERROR_MESSAGES } from "./security";

export * from "./constants/api";
export * from "./constants/ui";
export * from "./constants/wizard";
export * from "./constants/validation";
export * from "./constants/storage";
export * from "./constants/effects";
export * from "./constants/keyboard";
export * from "./constants/accessibility";
export * from "./constants/content";
