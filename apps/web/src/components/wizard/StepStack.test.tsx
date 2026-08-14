/**
 * Tests for StepStack (Step 2: Technology Stack Selection)
 *
 * Issue #1014 — this component previously had no real tests (only a vi.mock
 * stub inside Wizard.test.tsx). Covers:
 * - Rendering basic structure (title, subtitle, category headings)
 * - Selection counter and minimum requirement enforcement
 * - Adding / removing technologies via chips
 * - Selected summary with per-item removal
 * - Navigation (back / next) with validation
 * - Accessibility (aria-pressed, live region, labels)
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { StepStack } from "./StepStack";
import { useWizardStore } from "../../store";
import type { WizardStore } from "../../store/wizard";
import { TECH_STACK_OPTIONS } from "@blueprint/shared/schema";
import type { TechStackItemType } from "@blueprint/shared/types";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";
import {
  UI_CONTENT,
  MIN_REQUIREMENTS,
  VALIDATION_MESSAGES,
  TIMEOUTS,
} from "../../config/constants";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";

// Mock framer-motion to render plain HTML elements
vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    button: vi.fn(({ children, whileHover: _w1, whileTap: _w2, animate: _a, ...props }) => (
      <button {...props}>{children}</button>
    )),
    li: vi.fn(({ children, ...props }) => <li {...props}>{children}</li>),
    svg: vi.fn(({ children, ...props }) => <svg {...props}>{children}</svg>),
    path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
    p: vi.fn(({ children, ...props }) => <p {...props}>{children}</p>),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  button: vi.fn(({ children, whileHover: _w1, whileTap: _w2, animate: _a, ...props }) => (
    <button {...props}>{children}</button>
  )),
  li: vi.fn(({ children, ...props }) => <li {...props}>{children}</li>),
  svg: vi.fn(({ children, ...props }) => <svg {...props}>{children}</svg>),
  path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
  p: vi.fn(({ children, ...props }) => <p {...props}>{children}</p>),
}));

// Mock platform utilities
vi.mock("../../lib/platform", () => ({
  getModifierLabel: () => "Ctrl",
  getAltKeyLabel: () => "Alt",
  getAriaShortcutKey: (_: string, mod: string) => `${mod}+ArrowLeft`,
}));

// Mock child components
vi.mock("../RippleButton", () => ({
  RippleButton: vi.fn(({ children, onClick, disabled, className, ...props }) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  )),
}));

vi.mock("../SmartTooltip", () => ({
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

// Mock the store
vi.mock("../../store", () => ({
  useWizardStore: vi.fn(),
}));

const createMockStore = (overrides: Partial<WizardStore> = {}): WizardStore => {
  const defaultStore: WizardStore = {
    currentStep: WIZARD_STEP_KEYS.STACK,
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
    ...overrides,
  };
  return defaultStore;
};

const TECH_STACK_MOCK: TechStackItemType[] = [
  { name: "React", category: "frontend" },
  { name: "Hono", category: "backend" },
];

let mockStore: WizardStore;

describe("StepStack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockStore = createMockStore();
    (useWizardStore as unknown as Mock).mockImplementation(
      (selector: (state: WizardStore) => unknown) => selector(mockStore)
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ======== Basic Rendering ========

  it("renders the title and subtitle", () => {
    render(<StepStack />);
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_STACK.TITLE)).toBeInTheDocument();
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_STACK.SUBTITLE)).toBeInTheDocument();
  });

  it("renders all tech stack category headings", () => {
    render(<StepStack />);
    for (const category of Object.keys(TECH_STACK_OPTIONS)) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });

  it("renders tech chips for each option", () => {
    render(<StepStack />);
    const allOptions = Object.values(TECH_STACK_OPTIONS).flat();
    for (const tech of allOptions) {
      expect(screen.getByText(tech.name)).toBeInTheDocument();
    }
  });

  it("shows the selection counter at 0 initially", () => {
    render(<StepStack />);
    expect(screen.getByText(`0/${MIN_REQUIREMENTS.TECH_STACK}`)).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        ACCESSIBILITY_LABELS.WIZARD_STACK.COUNTER(0, MIN_REQUIREMENTS.TECH_STACK)
      )
    ).toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    render(<StepStack />);
    expect(screen.getByText(UI_CONTENT.BUTTONS.BACK_TO_INFO)).toBeInTheDocument();
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_STACK.NEXT_BUTTON)).toBeInTheDocument();
  });

  // ======== Selection Behavior ========

  it("keeps the next button enabled when no tech is selected", () => {
    render(<StepStack />);
    const nextButton = screen.getByText(UI_CONTENT.WIZARD.STEP_STACK.NEXT_BUTTON);
    expect(nextButton).toBeEnabled();
  });

  it("calls addTechStack when an unselected chip is clicked", () => {
    render(<StepStack />);
    fireEvent.click(screen.getByText("React"));
    expect(mockStore.addTechStack).toHaveBeenCalledWith({
      name: "React",
      category: "frontend",
    });
  });

  it("sets aria-pressed on chips based on selection state", () => {
    mockStore.techStack = [{ name: "React", category: "frontend" }];
    render(<StepStack />);
    const selectedChip = screen.getByRole("button", { name: /^React$/ });
    const unselectedChip = screen.getByRole("button", { name: /Vue\.js/ });
    expect(selectedChip).toHaveAttribute("aria-pressed", "true");
    expect(unselectedChip).toHaveAttribute("aria-pressed", "false");
  });

  it("calls removeTechStack when a selected chip is clicked again", () => {
    mockStore.techStack = [{ name: "React", category: "frontend" }];
    render(<StepStack />);
    fireEvent.click(screen.getByRole("button", { name: /^React$/ }));
    expect(mockStore.removeTechStack).toHaveBeenCalledWith("React");
  });

  it("toggles a chip via Enter key", () => {
    render(<StepStack />);
    fireEvent.keyDown(screen.getByRole("button", { name: /Hono/ }), { key: "Enter" });
    expect(mockStore.addTechStack).toHaveBeenCalledWith({
      name: "Hono",
      category: "backend",
    });
  });

  // ======== Selected Summary ========

  it("renders the selected summary with per-item remove buttons", () => {
    mockStore.techStack = TECH_STACK_MOCK;
    render(<StepStack />);
    expect(screen.getByText(/Selected \(2\)/)).toBeInTheDocument();
    for (const tech of TECH_STACK_MOCK) {
      expect(screen.getAllByText(tech.name).length).toBeGreaterThan(0);
      expect(
        screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_STACK.REMOVE_TECH(tech.name))
      ).toBeInTheDocument();
    }
  });

  it("removes a tech via the summary remove button", () => {
    mockStore.techStack = TECH_STACK_MOCK;
    render(<StepStack />);
    fireEvent.click(screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_STACK.REMOVE_TECH("React")));
    expect(mockStore.removeTechStack).toHaveBeenCalledWith("React");
  });

  it("does not render the selected summary when nothing is selected", () => {
    render(<StepStack />);
    expect(
      screen.queryByText(UI_CONTENT.WIZARD.STEP_STACK.SELECTED_LABEL(0))
    ).not.toBeInTheDocument();
  });

  // ======== Validation & Navigation ========

  it("enables the next button once the minimum is met and calls nextStep", () => {
    mockStore.techStack = [{ name: "React", category: "frontend" }];
    render(<StepStack />);
    const nextButton = screen.getByText(UI_CONTENT.WIZARD.STEP_STACK.NEXT_BUTTON);
    expect(nextButton).toBeEnabled();
    fireEvent.click(nextButton);
    expect(mockStore.nextStep).toHaveBeenCalledTimes(1);
  });

  it("does not advance when next is clicked without a selection and shows the validation error", () => {
    render(<StepStack />);
    fireEvent.click(screen.getByText(UI_CONTENT.WIZARD.STEP_STACK.NEXT_BUTTON));
    expect(mockStore.nextStep).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      VALIDATION_MESSAGES.TECH_STACK_MIN(MIN_REQUIREMENTS.TECH_STACK)
    );
  });

  it("persists the validation error until a tech is selected", () => {
    render(<StepStack />);
    fireEvent.click(screen.getByText(UI_CONTENT.WIZARD.STEP_STACK.NEXT_BUTTON));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(TIMEOUTS.SHAKE_ANIMATION);
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("clears the validation error once a tech is selected", () => {
    render(<StepStack />);
    fireEvent.click(screen.getByText(UI_CONTENT.WIZARD.STEP_STACK.NEXT_BUTTON));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByText("React"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls prevStep when the back button is clicked", () => {
    render(<StepStack />);
    fireEvent.click(screen.getByText(UI_CONTENT.BUTTONS.BACK_TO_INFO));
    expect(mockStore.prevStep).toHaveBeenCalledTimes(1);
  });

  // ======== Accessibility ========

  it("announces when the minimum selection is met", () => {
    const { rerender } = render(<StepStack direction="backward" />);
    expect(
      screen.queryByText(ACCESSIBILITY_LABELS.WIZARD_STACK.MINIMUM_MET_ANNOUNCEMENT)
    ).not.toBeInTheDocument();
    mockStore.techStack = [{ name: "React", category: "frontend" }];
    act(() => {
      rerender(<StepStack direction="forward" />);
    });
    expect(
      screen.getByText(ACCESSIBILITY_LABELS.WIZARD_STACK.MINIMUM_MET_ANNOUNCEMENT)
    ).toBeInTheDocument();
  });
});
