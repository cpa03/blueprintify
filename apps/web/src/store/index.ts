/**
 * @fileoverview Store Index - Central export point for all Zustand stores
 *
 * This module provides a unified interface for importing all application stores.
 * It also includes utility functions for cross-store operations.
 *
 * @module store
 *
 * ## Selector Pattern Guidelines
 *
 * Zustand 4.4+ provides `useShallow` (import from `zustand/react/shallow`) for
 * shallow comparison optimization when selecting multiple values as an object.
 * However, the most performant pattern is to use individual primitive selectors:
 *
 * ### ✅ RECOMMENDED: Individual Primitive Selectors (Most Performant)
 * ```tsx
 * // Each selector returns a primitive - strict equality check (===)
 * // Component only re-renders when THAT specific value changes
 * const projectName = useWizardStore((s) => s.projectName);
 * const description = useWizardStore((s) => s.description);
 * const setProjectName = useWizardStore((s) => s.setProjectName);
 * ```
 *
 * ### ⚠️ USE WITH CAUTION: Object Selectors with useShallow
 * ```tsx
 * // Only use when you MUST destructure multiple values
 * // useShallow does shallow comparison to prevent unnecessary re-renders
 * import { useShallow } from 'zustand/react/shallow';
 *
 * const { projectName, description } = useWizardStore(
 *   useShallow((s) => ({
 *     projectName: s.projectName,
 *     description: s.description,
 *   }))
 * );
 * ```
 *
 * ### ❌ AVOID: Object Selectors without useShallow
 * ```tsx
 * // This causes re-render on ANY wizard state change!
 * // The object is recreated on every store update
 * const { projectName, description } = useWizardStore((s) => ({
 *   projectName: s.projectName,
 *   description: s.description,
 * }));
 * ```
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
import { useToastStore } from "./toast";

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
  useToastStore.getState().clearAll();
}
