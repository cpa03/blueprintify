import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { EditorEmptyState } from "./EditorEmptyState";
import { useWizardStore } from "../store";
import type { WizardStore } from "../store/wizard";
import { WIZARD_STEPS } from "../config/constants";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";

vi.mock("../store", () => ({
  useWizardStore: vi.fn(),
}));

// Framer motion subpath mock (framer-motion/m exports motion components)
vi.mock(import("framer-motion/m"), async (importOriginal) => {
  const Actual = await importOriginal();
  return {
    ...Actual,
    motion: new Proxy(
      {},
      {
        get: (_target, prop) => {
          const component = prop as string;
          const ActualMotion = (Actual as unknown as Record<string, unknown>).motion as Record<
            string,
            unknown
          >;
          if (ActualMotion && typeof ActualMotion[component] === "function") {
            return ActualMotion[component];
          }
          return vi.fn(({ children, ...props }) => (
            <div data-motion-component={component} data-testid={`motion-${component}`} {...props}>
              {children}
            </div>
          ));
        },
      }
    ),
  };
});

const mockWizardStore: WizardStore = {
  currentStep: WIZARD_STEP_KEYS.INFO,
  projectName: "",
  description: "",
  targetAudience: "",
  constraints: "",
  techStack: [],
  features: [],
  setProjectName: vi.fn(),
  setDescription: vi.fn(),
  setTargetAudience: vi.fn(),
  setConstraints: vi.fn(),
  addTechStack: vi.fn(),
  removeTechStack: vi.fn(),
  setTechStack: vi.fn(),
  addFeature: vi.fn(),
  removeFeature: vi.fn(),
  clearFeatures: vi.fn(),
  clearForm: vi.fn(),
  setStep: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  reset: vi.fn(),
  loadTemplate: vi.fn(),
};

describe("EditorEmptyState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useWizardStore as unknown as Mock).mockImplementation(
      (selector: (state: WizardStore) => unknown) => selector(mockWizardStore)
    );
  });

  it("renders the title", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText("Your blueprint is waiting to be created")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<EditorEmptyState />);
    expect(
      screen.getByText("Complete the wizard steps to generate your project documentation")
    ).toBeInTheDocument();
  });

  it("shows progress as 1 of N when on first step", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText(/1 of/)).toBeInTheDocument();
  });

  it("shows keyboard shortcut hint", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
  });

  it("shows submit wizard hint with shortcut key", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText("Submit wizard")).toBeInTheDocument();
  });

  it("shows next step hint", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText("Next step")).toBeInTheDocument();
  });

  it("shows currently-on step label", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText(WIZARD_STEPS[0].label)).toBeInTheDocument();
  });

  it("shows progress percentage", () => {
    render(<EditorEmptyState />);
    const percentText = screen.getByText(/%/);
    expect(percentText).toBeInTheDocument();
  });

  it("renders without crashing when currentStep is the last step", () => {
    (useWizardStore as unknown as Mock).mockImplementation(
      (selector: (state: WizardStore) => unknown) =>
        selector({ ...mockWizardStore, currentStep: WIZARD_STEP_KEYS.GENERATING })
    );
    render(<EditorEmptyState />);
    expect(screen.getByText("Your blueprint is waiting to be created")).toBeInTheDocument();
  });
});
