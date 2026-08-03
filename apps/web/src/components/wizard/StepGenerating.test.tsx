/**
 * Tests for StepGenerating (Step 5: Generation Progress)
 *
 * Covers:
 * - Rendering the Cancel button with its aria-label while generating
 * - Cancel click behavior (cancelGeneration + toast + navigation to REVIEW)
 * - Re-entry guard blocking duplicate cancellation on rapid double-click
 * - Disabled + "Cancelling..." feedback while cancellation is in flight
 * - Escape reflected in the aria-keyshortcuts attribute
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { StepGenerating } from "./StepGenerating";
import { useEditorStore, useWizardStore } from "../../store";
import type { EditorStore } from "../../store/editor";
import type { WizardStore } from "../../store/wizard";
import {
  ANIMATION,
  EDITOR_TABS,
  TOAST_MESSAGES,
  WIZARD_GENERATING_LABELS,
} from "../../config/constants";
import { KEYBOARD_EVENT_KEYS, TIME_UNITS, WIZARD_STEP_KEYS } from "@blueprint/shared/config";

// Mock framer-motion to render plain HTML elements
vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    circle: vi.fn(({ children, ...props }) => <circle {...props}>{children}</circle>),
    path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  h2: vi.fn(({ children, ...props }) => <h2 {...props}>{children}</h2>),
  p: vi.fn(({ children, ...props }) => <p {...props}>{children}</p>),
  circle: vi.fn(({ children, ...props }) => <circle {...props}>{children}</circle>),
  path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
}));

// Mock platform utilities
vi.mock("../../lib/platform", () => ({
  getModifierLabel: () => "Ctrl",
  getAltKeyLabel: () => "Alt",
  getAriaShortcutKey: (_: string, mod: string) => `${mod}+E`,
}));

// Mock the store — useEditorStore/useWizardStore are selector-based hooks,
// useToast returns a shared mock so tests can assert on toast calls.
const mockToast = { info: vi.fn(), error: vi.fn() };

vi.mock("../../store", () => ({
  useEditorStore: vi.fn(),
  useWizardStore: vi.fn(),
  useToast: vi.fn(() => mockToast),
}));

// Mock child components
vi.mock("../RippleButton", () => ({
  RippleButton: vi.fn(({ children, onClick, disabled, isLoading, ariaLabel, type, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-busy={isLoading ? "true" : undefined}
      type={type}
      {...props}
    >
      {children}
    </button>
  )),
}));

vi.mock("../SmartTooltip", () => ({
  KeyboardShortcutTooltip: vi.fn(({ children, shortcut: _s, description: _d, position: _p }) => (
    <>{children}</>
  )),
}));

// Mock the reduced-motion hook so entrance animations run eagerly
vi.mock("../../hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

// Mock the reduced-motion context consumed by AnimatedNumber so the stat
// counters render without a provider wrapper in unit tests.
vi.mock("../../context/ReducedMotionContext", () => ({
  useReducedMotionContext: vi.fn(() => ({
    shouldAnimate: false,
    getDuration: vi.fn((d: number) => d),
  })),
}));

const createMockEditorStore = (overrides: Partial<EditorStore> = {}): EditorStore => ({
  activeTab: EDITOR_TABS.BLUEPRINT,
  blueprintContent: "",
  tasksContent: "",
  isDirty: false,
  isGenerating: true,
  generationProgress: "",
  setActiveTab: vi.fn(),
  setBlueprintContent: vi.fn(),
  appendBlueprintContent: vi.fn(),
  setTasksContent: vi.fn(),
  appendTasksContent: vi.fn(),
  setIsGenerating: vi.fn(),
  setGenerationProgress: vi.fn(),
  markClean: vi.fn(),
  cancelGeneration: vi.fn(),
  reset: vi.fn(),
  flushStorage: vi.fn(),
  ...overrides,
});

const createMockWizardStore = (overrides: Partial<WizardStore> = {}): WizardStore => ({
  currentStep: WIZARD_STEP_KEYS.GENERATING,
  projectName: "Test Project",
  description: "Test description",
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
  ...overrides,
});

let mockEditorStore: EditorStore;
let mockWizardStore: WizardStore;

describe("StepGenerating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockEditorStore = createMockEditorStore();
    mockWizardStore = createMockWizardStore();
    (useEditorStore as unknown as Mock).mockImplementation(
      (selector: (state: EditorStore) => unknown) => selector(mockEditorStore)
    );
    (useWizardStore as unknown as Mock).mockImplementation(
      (selector: (state: WizardStore) => unknown) => selector(mockWizardStore)
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The Cancel button starts with tabIndex={-1} until its entrance animation
  // finishes (ANIMATION.SLOW * 2 seconds), but it is always rendered and
  // clickable — advancing timers just mirrors the production focusability.
  const advanceToCancelButtonReady = () => {
    act(() => {
      vi.advanceTimersByTime(ANIMATION.SLOW * 2 * TIME_UNITS.MS_PER_SECOND);
    });
  };

  const renderGenerating = () => {
    render(<StepGenerating />);
    advanceToCancelButtonReady();
  };

  const getCancelButton = () =>
    screen.getByRole("button", { name: WIZARD_GENERATING_LABELS.CANCEL_GENERATION_ARIA });

  it("renders the Cancel button with the correct aria-label while generating", () => {
    renderGenerating();
    expect(getCancelButton()).toBeInTheDocument();
    expect(getCancelButton()).toHaveAttribute(
      "aria-label",
      WIZARD_GENERATING_LABELS.CANCEL_GENERATION_ARIA
    );
  });

  it("cancels once, shows one toast, and navigates to REVIEW on click", () => {
    renderGenerating();
    fireEvent.click(getCancelButton());

    expect(mockEditorStore.cancelGeneration).toHaveBeenCalledTimes(1);
    expect(mockToast.info).toHaveBeenCalledTimes(1);
    expect(mockToast.info).toHaveBeenCalledWith(TOAST_MESSAGES.GENERATION_CANCELLED);
    expect(mockWizardStore.setStep).toHaveBeenCalledTimes(1);
    expect(mockWizardStore.setStep).toHaveBeenCalledWith(WIZARD_STEP_KEYS.REVIEW);
  });

  it("fires cancellation exactly once on rapid double-click (re-entry guard)", () => {
    renderGenerating();
    const button = getCancelButton();

    // Dispatch both clicks synchronously in the same act tick so the second
    // click reaches the handler before React re-renders — only the synchronous
    // cancelGuardRef can block it.
    act(() => {
      button.click();
      button.click();
    });

    expect(mockEditorStore.cancelGeneration).toHaveBeenCalledTimes(1);
    expect(mockToast.info).toHaveBeenCalledTimes(1);
    expect(mockWizardStore.setStep).toHaveBeenCalledTimes(1);
  });

  it("disables the Cancel button and shows 'Cancelling...' after the first click", () => {
    renderGenerating();
    const button = getCancelButton();
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute(
      "aria-label",
      WIZARD_GENERATING_LABELS.CANCELLING_GENERATION_ARIA
    );
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(WIZARD_GENERATING_LABELS.CANCELLING_GENERATION)).toBeInTheDocument();
    expect(screen.queryByText(WIZARD_GENERATING_LABELS.CANCEL_GENERATION)).not.toBeInTheDocument();
  });

  it("reflects the Escape shortcut in the aria-keyshortcuts attribute", () => {
    renderGenerating();
    expect(getCancelButton()).toHaveAttribute("aria-keyshortcuts", KEYBOARD_EVENT_KEYS.ESCAPE);
  });

  it("announces generated line counts via the dedicated role=status announcer", () => {
    // The AnimatedNumber stat counters are decorative (aria-hidden) because their
    // text rewrites every animation frame; the sr-only role=status region below
    // is the authoritative screen-reader announcement for the same counts.
    mockEditorStore.blueprintContent = "line1\nline2\nline3";
    mockEditorStore.tasksContent = "task1\ntask2";
    renderGenerating();

    const statusRegions = screen.getAllByRole("status");
    const announcer = statusRegions.find((el) => el.textContent?.includes("blueprint lines"));
    expect(announcer).toBeDefined();
    // While generating, the announcer uses the ELAPSED template (timerActive).
    expect(announcer?.textContent).toContain("3 blueprint lines and 2 task lines");
  });
});
