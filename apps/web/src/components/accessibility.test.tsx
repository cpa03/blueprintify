import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { SkipLink } from "./SkipLink";
import { StepIndicator } from "./StepIndicator";
import { useWizardStore, useEditorStore } from "../store";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";
import type { WizardStore } from "../store/wizard";

const { toast } = vi.hoisted(() => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../store", () => ({
  useWizardStore: vi.fn(),
  useEditorStore: vi.fn(),
  useToast: () => toast,
}));

vi.mock("../config/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../config/constants")>();
  const { WIZARD_STEP_KEYS } = await import("@blueprint/shared");
  return {
    ...actual,
    WIZARD_STEPS: [
      { key: WIZARD_STEP_KEYS.INFO, label: "Project Info", icon: "document", shortcut: "1" },
      { key: WIZARD_STEP_KEYS.STACK, label: "Tech Stack", icon: "sliders", shortcut: "2" },
      { key: WIZARD_STEP_KEYS.FEATURES, label: "Features", icon: "sparkles", shortcut: "3" },
      { key: WIZARD_STEP_KEYS.REVIEW, label: "Review", icon: "eye", shortcut: "4" },
      { key: WIZARD_STEP_KEYS.GENERATING, label: "Generating", icon: "lightning", shortcut: "5" },
    ],
    ACCESSIBILITY_LABELS: {
      PROGRESS: {
        STEPS_COMPLETE: () => `Steps complete`,
        STEP_OF_ARIA: (_index: number, _total: number, label: string) => `${label}`,
      },
      STEP_ANNOUNCER: {
        STEP_TRANSITION: (completedLabel: string, activatedLabel: string) =>
          `Step ${completedLabel} complete, now on Step ${activatedLabel}`,
      },
      STEP: {
        SHORTCUT_FORMAT: (label: string, shortcut: string) => `${label} (Alt+${shortcut})`,
      },
    },
  };
});

vi.mock("framer-motion", () => {
  const motion = {
    button: vi.fn(
      ({ children, onClick, disabled, whileHover: _whileHover, whileTap: _whileTap, ...props }) => (
        <button {...props} onClick={onClick} disabled={disabled}>
          {children}
        </button>
      )
    ),
    div: vi.fn(
      ({
        children,
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        whileHover: _whileHover,
        whileTap: _whileTap,
        ...props
      }) => <div {...props}>{children}</div>
    ),
    circle: vi.fn(({ initial: _initial, animate: _animate, transition: _transition, ...props }) => (
      <circle {...props} />
    )),
    span: vi.fn(
      ({ children, initial: _initial, animate: _animate, transition: _transition, ...props }) => (
        <span {...props}>{children}</span>
      )
    ),
  };
  return {
    motion,
    AnimatePresence: vi.fn(({ children }) => <>{children}</>),
  };
});

const mockWizardStore: WizardStore = {
  currentStep: WIZARD_STEP_KEYS.INFO,
  projectName: "",
  description: "",
  techStack: [],
  features: [],
  targetAudience: "",
  constraints: "",
  setStep: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  setProjectName: vi.fn(),
  setDescription: vi.fn(),
  addTechStack: vi.fn(),
  removeTechStack: vi.fn(),
  setTechStack: vi.fn(),
  addFeature: vi.fn(),
  removeFeature: vi.fn(),
  clearFeatures: vi.fn(),
  clearForm: vi.fn(),
  setTargetAudience: vi.fn(),
  setConstraints: vi.fn(),
  reset: vi.fn(),
  loadTemplate: vi.fn(),
  flushStorage: vi.fn(),
};

// jsdom cannot compute real colors, so the color-contrast rule is always
// "incomplete" there; disable it to focus on structural accessibility.
const AXE_CONFIG = {
  rules: { "color-contrast": { enabled: false } },
};

beforeEach(() => {
  vi.clearAllMocks();
  (useWizardStore as unknown as Mock).mockImplementation(
    (selector: (state: WizardStore) => unknown) => selector(mockWizardStore)
  );
  (useEditorStore as unknown as Mock).mockImplementation(
    (selector: (state: { isGenerating: boolean; generationProgress: string }) => unknown) =>
      selector({ isGenerating: false, generationProgress: "" })
  );
});

describe("Accessibility (axe)", () => {
  it("SkipLink has no accessibility violations", async () => {
    const { container } = render(<SkipLink />);
    const results = await axe(container, AXE_CONFIG);
    expect(results.violations).toHaveLength(0);
  });

  it("StepIndicator (all steps unlocked) has no accessibility violations", async () => {
    const { container } = render(<StepIndicator />);
    const results = await axe(container, AXE_CONFIG);
    expect(results.violations).toHaveLength(0);
  });

  it("StepIndicator (locked future steps via aria-disabled) has no accessibility violations", async () => {
    mockWizardStore.currentStep = WIZARD_STEP_KEYS.FEATURES;
    const { container } = render(<StepIndicator />);
    const results = await axe(container, AXE_CONFIG);
    expect(results.violations).toHaveLength(0);
  });
});
