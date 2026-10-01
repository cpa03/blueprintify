import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";
import { UI_CONTENT, ACCESSIBILITY_LABELS } from "./config/constants";

const WIZARD_LOADING_LABEL = ACCESSIBILITY_LABELS.WIZARD.LOADING_STEP;
const STEP_INFO_TITLE = UI_CONTENT.WIZARD.STEP_INFO.TITLE;
const REVIEW_TITLE = "Review your project";
const LAZY_TIMEOUT_MS = 20000;
// Both timeouts are generous because each suite pays a cold transform of the
// whole App tree: the imports happen inside the test body rather than at
// collection time, and the lazy Wizard chain only resolves after several
// dynamic imports.
const TEST_TIMEOUT_MS = 45000;

/** `wizardStorage` is registered without a payload type, so `get()` resolves to `unknown`. */
interface PersistedWizardShape {
  currentStep?: string;
}

/**
 * Mounts a full `App` through a freshly evaluated module registry. That is what
 * makes these suites faithful to a browser reload: the wizard and editor stores
 * self-initialise on import (`void loadState(set)`), so only a fresh registry
 * re-reads localStorage the way a page load does. Every module participating in
 * the render — including `@testing-library/react` — is imported dynamically after
 * `vi.resetModules()`, so the whole tree agrees on one React instance.
 */
async function mountApp() {
  vi.resetModules();
  const [{ render, screen, fireEvent }, appModule, motionContext, exportContext, motionWrapper] =
    await Promise.all([
      import("@testing-library/react"),
      import("./App"),
      import("./context/ReducedMotionContext"),
      import("./context/ExportContext"),
      import("./components/MotionConfigWrapper"),
    ]);
  render(
    <motionContext.ReducedMotionProvider>
      <exportContext.ExportProvider>
        <motionWrapper.MotionConfigWrapper>
          <appModule.default />
        </motionWrapper.MotionConfigWrapper>
      </exportContext.ExportProvider>
    </motionContext.ReducedMotionProvider>
  );
  return { screen, fireEvent };
}

describe("App wizard activation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it(
    "reaches the wizard from the step indicator without picking a template",
    async () => {
      const { screen, fireEvent } = await mountApp();

      // A visitor with no saved project lands on the first step. The wizard is
      // lazily mounted, so only its skeleton placeholder exists at this point.
      expect(screen.queryByRole("heading", { name: STEP_INFO_TITLE })).toBeNull();
      expect(screen.getAllByLabelText(WIZARD_LOADING_LABEL).length).toBeGreaterThan(0);

      // "Project Info" is already the current step, so this click navigates
      // nowhere — it is purely an activation gesture. It must still mount the
      // wizard, otherwise a first-time visitor has no way in.
      fireEvent.click(screen.getByRole("button", { name: /Project Info/i }));

      expect(
        await screen.findByRole("heading", { name: STEP_INFO_TITLE }, { timeout: LAZY_TIMEOUT_MS })
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(WIZARD_LOADING_LABEL)).toBeNull();
    },
    TEST_TIMEOUT_MS
  );

  it(
    "restores a saved project after reload and resumes at its persisted step",
    async () => {
      // Drive the real store and let the real debounced writer flush, so the
      // payload on disk comes from the production save path rather than from this
      // test. A hand-written fixture would keep passing if the save path dropped
      // `currentStep` again, which is precisely the defect under test.
      vi.resetModules();
      const wizardStore = await import("./store/wizard");
      const { wizardStorage } = await import("./lib/storage");

      wizardStore.useWizardStore.getState().setStep(WIZARD_STEP_KEYS.REVIEW);
      wizardStore.useWizardStore.getState().setProjectName("Restored Project");
      await wizardStore.useWizardStore.getState().flushStorage();

      const persisted = (await wizardStorage.get()) as PersistedWizardShape | null;
      expect(persisted?.currentStep).toBe(WIZARD_STEP_KEYS.REVIEW);

      // Now reload: a fresh module registry against the same localStorage.
      const { screen } = await mountApp();

      // The saved project is visible rather than the first-time landing page...
      expect(
        await screen.findByRole("heading", { name: REVIEW_TITLE }, { timeout: LAZY_TIMEOUT_MS })
      ).toBeInTheDocument();

      // ...and the wizard resumes on the step that was persisted.
      expect(screen.getByRole("button", { name: /Review/i })).toHaveAttribute(
        "aria-current",
        "step"
      );
      expect(screen.getByText("Restored Project")).toBeInTheDocument();
    },
    TEST_TIMEOUT_MS
  );
});
