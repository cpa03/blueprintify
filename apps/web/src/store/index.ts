export * from "./wizard";
export * from "./editor";

import { useWizardStore } from "./wizard";
import { useEditorStore } from "./editor";

/**
 * Reset all application state
 * Consolidated reset action for both wizard and editor stores
 */
export function resetAllStores(): void {
  useWizardStore.getState().reset();
  useEditorStore.getState().reset();
}
