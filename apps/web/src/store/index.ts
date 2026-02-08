export * from "./wizard";
export * from "./editor";
export * from "./toast";

import { useWizardStore } from "./wizard";
import { useEditorStore } from "./editor";

export function resetAllStores(): void {
  useWizardStore.getState().reset();
  useEditorStore.getState().reset();
}
