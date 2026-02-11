export * from "./wizard";
export * from "./editor";
export * from "./toast";
export * from "./session";
export * from "./refinement";

import { useWizardStore } from "./wizard";
import { useEditorStore } from "./editor";
import { useSessionStore } from "./session";
import { useRefinementStore } from "./refinement";

export function resetAllStores(): void {
  useWizardStore.getState().reset();
  useEditorStore.getState().reset();
  useSessionStore.getState().setCurrentSession(null);
  useRefinementStore.getState().reset();
}
