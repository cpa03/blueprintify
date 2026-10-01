import { describe, it, expect, beforeEach, vi } from "vitest";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";
import { STORAGE_KEYS } from "../config/keys";

/**
 * `wizardStorage` is registered without a payload type, so `get()` resolves to
 * `unknown`. Narrow it to the fields this suite asserts on.
 */
interface PersistedWizardShape {
  currentStep?: string;
}

/**
 * Exercises the wizard store's persistence contract against the real
 * storage layer. `wizard.test.ts` stubs both `../lib/storage` and
 * `./persistence`, so the payload actually written to localStorage is only
 * observable here.
 */
async function writeRawWizardPayload(data: Record<string, unknown>): Promise<void> {
  const now = new Date().toISOString();
  localStorage.setItem(
    STORAGE_KEYS.WIZARD,
    JSON.stringify({
      data,
      metadata: { version: 1, createdAt: now, updatedAt: now, checksum: "test-checksum" },
    })
  );
}

async function loadFreshWizardStore() {
  vi.resetModules();
  return import("./wizard");
}

describe("wizard store persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("includes currentStep in the persisted payload", async () => {
    const { useWizardStore } = await loadFreshWizardStore();
    const { wizardStorage } = await import("../lib/storage");

    useWizardStore.getState().setStep(WIZARD_STEP_KEYS.REVIEW);
    await useWizardStore.getState().flushStorage();

    const persisted = (await wizardStorage.get()) as PersistedWizardShape | null;
    expect(persisted?.currentStep).toBe(WIZARD_STEP_KEYS.REVIEW);
  });

  it("restores a persisted currentStep", async () => {
    await writeRawWizardPayload({
      currentStep: WIZARD_STEP_KEYS.FEATURES,
      projectName: "Saved App",
      description: "",
      techStack: [],
      features: [],
      targetAudience: "",
      constraints: "",
    });

    const { useWizardStore } = await loadFreshWizardStore();
    await vi.waitFor(() =>
      expect(useWizardStore.getState().currentStep).toBe(WIZARD_STEP_KEYS.FEATURES)
    );
  });

  it("resumes at REVIEW when GENERATING was persisted, since generation state is not persisted", async () => {
    await writeRawWizardPayload({
      currentStep: WIZARD_STEP_KEYS.GENERATING,
      projectName: "Interrupted App",
      description: "",
      techStack: [],
      features: [],
      targetAudience: "",
      constraints: "",
    });

    const { useWizardStore } = await loadFreshWizardStore();
    await vi.waitFor(() =>
      expect(useWizardStore.getState().currentStep).toBe(WIZARD_STEP_KEYS.REVIEW)
    );
  });

  it("leaves the step untouched for payloads written before currentStep was persisted", async () => {
    await writeRawWizardPayload({
      projectName: "Legacy App",
      description: "",
      techStack: [],
      features: [],
      targetAudience: "",
      constraints: "",
    });

    const { useWizardStore } = await loadFreshWizardStore();
    await vi.waitFor(() => expect(useWizardStore.getState().projectName).toBe("Legacy App"));
    expect(useWizardStore.getState().currentStep).toBe(WIZARD_STEP_KEYS.INFO);
  });
});
