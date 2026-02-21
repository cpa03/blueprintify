/**
 * @fileoverview Store module exports and utilities
 *
 * Central export point for all Zustand stores. Provides a unified
 * interface for importing store hooks and utilities.
 *
 * @module store
 */

export * from "./wizard";
export * from "./editor";
export * from "./toast";

import { useWizardStore } from "./wizard";
import { useEditorStore } from "./editor";

/**
 * Reset all stores to their initial state
 *
 * Useful for:
 * - Logging out users
 * - Clearing all user data
 * - Resetting application state
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
