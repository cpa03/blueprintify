/**
 * @fileoverview Store Index - Central export point for all Zustand stores
 *
 * This module provides a unified interface for importing all application stores.
 * It also includes utility functions for cross-store operations.
 *
 * @module store
 *
 * @example
 * ```tsx
 * // Import individual stores
 * import { useWizardStore, useEditorStore } from '../store';
 *
 * // Import convenience hooks
 * import { useToast } from '../store';
 *
 * // Reset all stores at once
 * import { resetAllStores } from '../store';
 * ```
 */

export * from "./wizard";
export * from "./editor";
export * from "./toast";

import { useWizardStore } from "./wizard";
import { useEditorStore } from "./editor";

/**
 * Resets all application stores to their initial state.
 *
 * This function is useful for:
 * - Logging out users
 * - Clearing all application state
 * - Starting a fresh session
 *
 * @example
 * ```tsx
 * function LogoutButton() {
 *   const handleLogout = () => {
 *     resetAllStores();
 *     // Navigate to login page
 *   };
 *   return <button onClick={handleLogout}>Logout</button>;
 * }
 * ```
 */
export function resetAllStores(): void {
  useWizardStore.getState().reset();
  useEditorStore.getState().reset();
}
