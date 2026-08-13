/**
 * Tests for StepReview (Step 4: Review Configuration)
 *
 * Issue #1014 — this component previously had no real tests (only a vi.mock
 * stub inside Wizard.test.tsx). Covers:
 * - Rendering project info, tech stack, and features summary
 * - Edit buttons jumping to specific wizard steps
 * - Alt+1/2/3 keyboard shortcuts for section editing
 * - Generate button enablement and generation start
 * - Generating state (spinner, disabled controls)
 * - "What happens next" info card
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { StepReview } from "./StepReview";
import { useWizardStore } from "../../store";
import type { WizardStore } from "../../store/wizard";
import { useBlueprintStream } from "../../hooks/useBlueprintStream";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";
import {
  UI_CONTENT,
  WIZARD_REVIEW_DESCRIPTIONS,
  WIZARD_REVIEW_EDIT_SHORTCUTS,
} from "../../config/constants";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";

// Mock framer-motion to render plain HTML elements
vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    li: vi.fn(({ children, ...props }) => <li {...props}>{children}</li>),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  li: vi.fn(({ children, ...props }) => <li {...props}>{children}</li>),
  ul: vi.fn(({ children, ...props }) => <ul {...props}>{children}</ul>),
}));

// Mock platform utilities
vi.mock("../../lib/platform", () => ({
  getModifierLabel: () => "Ctrl",
  getAltKeyLabel: () => "Alt",
  getAriaShortcutKey: (_: string, mod: string) => `${mod}+ArrowLeft`,
}));

// Mock child components
vi.mock("../RippleButton", () => ({
  RippleButton: vi.fn(({ children, onClick, disabled, className, ariaLabel, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  )),
}));

vi.mock("../SmartTooltip", () => ({
  SmartTooltip: vi.fn(({ children }) => <>{children}</>),
  KeyboardShortcutTooltip: vi.fn(
    ({ children, shortcut: _s, description: _d, position: _p, modifier: _m }) => <>{children}</>
  ),
}));

vi.mock("../Icon", () => ({
  Icon: vi.fn(({ name, className }: { name: string; className?: string }) => (
    <span data-testid={`icon-${name}`} className={className}>
      {name}
    </span>
  )),
}));

// Mock the store and the generation hook
vi.mock("../../store", () => ({
  useWizardStore: vi.fn(),
}));

vi.mock("../../hooks/useBlueprintStream", () => ({
  useBlueprintStream: vi.fn(),
}));

const createMockStore = (overrides: Partial<WizardStore> = {}): WizardStore => {
  const defaultStore: WizardStore = {
    currentStep: WIZARD_STEP_KEYS.REVIEW,
    projectName: "My Project",
    description: "A sample project description",
    techStack: [
      { name: "React", category: "frontend" },
      { name: "Hono", category: "backend" },
    ],
    features: ["User auth", "API endpoints"],
    targetAudience: "Developers",
    constraints: "Must be serverless",
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
    ...overrides,
  };
  return defaultStore;
};

let mockStore: WizardStore;
let mockStream: { startGeneration: Mock; isGenerating: boolean; progress: string };

describe("StepReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    (useWizardStore as unknown as Mock).mockImplementation(
      (selector: (state: WizardStore) => unknown) => selector(mockStore)
    );
    mockStream = { startGeneration: vi.fn(), isGenerating: false, progress: "" };
    (useBlueprintStream as unknown as Mock).mockReturnValue(mockStream);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ======== Basic Rendering ========

  it("renders the review heading", () => {
    render(<StepReview />);
    expect(screen.getByRole("heading", { name: /Review your project/ })).toBeInTheDocument();
  });

  it("renders project information summary", () => {
    render(<StepReview />);
    expect(screen.getByText("My Project")).toBeInTheDocument();
    expect(screen.getByText("A sample project description")).toBeInTheDocument();
    expect(screen.getByText("Developers")).toBeInTheDocument();
    expect(screen.getByText("Must be serverless")).toBeInTheDocument();
  });

  it("omits optional fields that are empty", () => {
    mockStore.targetAudience = "";
    mockStore.constraints = "";
    render(<StepReview />);
    expect(screen.queryByText("Target Audience:")).not.toBeInTheDocument();
    expect(screen.queryByText("Constraints:")).not.toBeInTheDocument();
  });

  it("renders the tech stack summary with categories", () => {
    render(<StepReview />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Hono")).toBeInTheDocument();
    expect(screen.getByText("(frontend)")).toBeInTheDocument();
    expect(screen.getByText("(backend)")).toBeInTheDocument();
  });

  it("renders the features list when features exist", () => {
    render(<StepReview />);
    expect(screen.getByText("User auth")).toBeInTheDocument();
    expect(screen.getByText("API endpoints")).toBeInTheDocument();
  });

  it("renders the 'What happens next' info card", () => {
    render(<StepReview />);
    expect(screen.getByText(WIZARD_REVIEW_DESCRIPTIONS.WHAT_HAPPENS_NEXT)).toBeInTheDocument();
  });

  // ======== Edit Buttons ========

  it("jumps to the info step via the edit info button", () => {
    render(<StepReview />);
    fireEvent.click(screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_REVIEW.EDIT_INFO));
    expect(mockStore.setStep).toHaveBeenCalledWith(WIZARD_STEP_KEYS.INFO);
  });

  it("jumps to the stack step via the edit stack button", () => {
    render(<StepReview />);
    fireEvent.click(screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_REVIEW.EDIT_STACK));
    expect(mockStore.setStep).toHaveBeenCalledWith(WIZARD_STEP_KEYS.STACK);
  });

  it("jumps to the features step via the edit features button", () => {
    render(<StepReview />);
    fireEvent.click(screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_REVIEW.EDIT_FEATURES));
    expect(mockStore.setStep).toHaveBeenCalledWith(WIZARD_STEP_KEYS.FEATURES);
  });

  it("goes back to the features step via the back button", () => {
    render(<StepReview />);
    fireEvent.click(screen.getByText(UI_CONTENT.BUTTONS.BACK_TO_FEATURES));
    expect(mockStore.setStep).toHaveBeenCalledWith(WIZARD_STEP_KEYS.FEATURES);
  });

  // ======== Keyboard Shortcuts ========

  it("jumps to the info step via Alt+1", () => {
    render(<StepReview />);
    act(() => {
      fireEvent.keyDown(window, { key: WIZARD_REVIEW_EDIT_SHORTCUTS.INFO, altKey: true });
    });
    expect(mockStore.setStep).toHaveBeenCalledWith(WIZARD_STEP_KEYS.INFO);
  });

  it("jumps to the stack step via Alt+2", () => {
    render(<StepReview />);
    act(() => {
      fireEvent.keyDown(window, { key: WIZARD_REVIEW_EDIT_SHORTCUTS.STACK, altKey: true });
    });
    expect(mockStore.setStep).toHaveBeenCalledWith(WIZARD_STEP_KEYS.STACK);
  });

  it("jumps to the features step via Alt+3", () => {
    render(<StepReview />);
    act(() => {
      fireEvent.keyDown(window, { key: WIZARD_REVIEW_EDIT_SHORTCUTS.FEATURES, altKey: true });
    });
    expect(mockStore.setStep).toHaveBeenCalledWith(WIZARD_STEP_KEYS.FEATURES);
  });

  it("ignores plain key presses without Alt", () => {
    render(<StepReview />);
    act(() => {
      fireEvent.keyDown(window, { key: WIZARD_REVIEW_EDIT_SHORTCUTS.INFO });
    });
    expect(mockStore.setStep).not.toHaveBeenCalled();
  });

  // ======== Generate Button ========

  it("disables the generate button when project name is missing", () => {
    mockStore.projectName = "";
    render(<StepReview />);
    expect(
      screen.getByRole("button", { name: ACCESSIBILITY_LABELS.REVIEW.GENERATE_DISABLED_ARIA })
    ).toBeDisabled();
  });

  it("enables the generate button when required fields are present", () => {
    render(<StepReview />);
    const generateButton = screen.getByRole("button", {
      name: new RegExp(UI_CONTENT.WIZARD.STEP_REVIEW.GENERATE_BUTTON),
    });
    expect(generateButton).toBeEnabled();
  });

  it("calls startGeneration when the generate button is clicked", () => {
    render(<StepReview />);
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(UI_CONTENT.WIZARD.STEP_REVIEW.GENERATE_BUTTON),
      })
    );
    expect(mockStream.startGeneration).toHaveBeenCalledTimes(1);
  });

  it("shows a generating state with a disabled button", () => {
    mockStream.isGenerating = true;
    mockStream.progress = "Generating architecture...";
    render(<StepReview />);
    expect(
      screen.getByRole("button", {
        name: ACCESSIBILITY_LABELS.REVIEW.GENERATING_IN_PROGRESS_ARIA,
      })
    ).toBeDisabled();
    expect(screen.getByText("Generating...")).toBeInTheDocument();
    expect(screen.getByText("Generating architecture...")).toBeInTheDocument();
  });

  it("disables the back button while generating", () => {
    mockStream.isGenerating = true;
    render(<StepReview />);
    const backButton = screen.getByText(UI_CONTENT.BUTTONS.BACK_TO_FEATURES);
    expect(backButton).toBeDisabled();
  });
});
