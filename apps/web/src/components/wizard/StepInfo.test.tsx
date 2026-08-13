/**
 * Tests for StepInfo (Step 1: Project Information)
 *
 * Covers:
 * - Rendering basic structure (title, subtitle, form fields)
 * - Project name input behavior (typing, validation, clear)
 * - Description input behavior (typing, validation, clear)
 * - Target audience and constraints optional fields
 * - Form submission with valid/invalid state
 * - Character counters and limits
 * - Clear all form functionality
 * - Accessibility labels
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { StepInfo } from "./StepInfo";
import { useWizardStore } from "../../store";
import type { WizardStore } from "../../store/wizard";
import { UI_CONTENT, FORM_LIMITS, VALIDATION_MESSAGES } from "../../config/constants";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";

// Mock framer-motion to render plain HTML elements
vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    button: vi.fn(({ children, ...props }) => <button {...props}>{children}</button>),
    input: vi.fn(({ children, ...props }) => <input {...props}>{children ?? null}</input>),
    textarea: vi.fn(({ children, ...props }) => <textarea {...props}>{children ?? null}</textarea>),
    p: vi.fn(({ children, ...props }) => <p {...props}>{children}</p>),
    svg: vi.fn(({ children, ...props }) => <svg {...props}>{children}</svg>),
    path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  button: vi.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  input: vi.fn(({ children, ...props }) => <input {...props}>{children ?? null}</input>),
  textarea: vi.fn(({ children, ...props }) => <textarea {...props}>{children ?? null}</textarea>),
  p: vi.fn(({ children, ...props }) => <p {...props}>{children}</p>),
  svg: vi.fn(({ children, ...props }) => <svg {...props}>{children}</svg>),
  path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
}));

// Mock platform utilities
vi.mock("../../lib/platform", () => ({
  getModifierLabel: () => "Ctrl",
  getAltKeyLabel: () => "Alt",
  getAriaShortcutKey: (_: string, mod: string) => `${mod}+Enter`,
}));

// Mock child components
vi.mock("../RippleButton", () => ({
  RippleButton: vi.fn(({ children, onClick, disabled, type, ...props }) => (
    <button onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  )),
}));

vi.mock("../SmartTooltip", () => ({
  KeyboardShortcutTooltip: vi.fn(({ children, shortcut: _s, description: _d, position: _p }) => (
    <>{children}</>
  )),
}));

vi.mock("../CharacterCounter", () => ({
  CharacterCounter: vi.fn(({ current, max, _min, _warningThreshold }) => (
    <span data-testid="character-counter">
      {current}/{max}
    </span>
  )),
}));

vi.mock("../ValidationCheckmark", () => ({
  ValidationCheckmark: vi.fn(({ isValid, size, _ariaLabel, _invalidAriaLabel }) => (
    <span data-testid={`validation-checkmark-${isValid ? "valid" : "invalid"}`} data-size={size}>
      {isValid ? "✓" : "✗"}
    </span>
  )),
}));

vi.mock("../TypeIndicator", () => ({
  TypeIndicator: vi.fn(({ isTyping }) => (
    <span data-testid="typing-indicator">{isTyping ? "typing..." : ""}</span>
  )),
  useTypingIndicator: vi.fn(() => ({
    isTyping: false,
    handleTyping: vi.fn(),
    handleBlur: vi.fn(),
  })),
}));

// Mock hooks
vi.mock("../../hooks/useAutoSaveToast", () => ({
  useAutoSaveToast: vi.fn(),
}));

vi.mock("../../hooks/useAutoResizeTextarea", () => ({
  useAutoResizeTextarea: () => ({
    textareaRef: { current: null },
  }),
}));

// Mock the store
vi.mock("../../store", () => ({
  useWizardStore: vi.fn(),
}));

const createMockStore = (overrides: Partial<WizardStore> = {}): WizardStore => {
  const defaultStore: WizardStore = {
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
    ...overrides,
  };
  return defaultStore;
};

let mockStore: WizardStore;

describe("StepInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Mock scrollIntoView for form submit validation path
    Element.prototype.scrollIntoView = vi.fn();
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
    render(<StepInfo />);
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.TITLE)).toBeInTheDocument();
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.SUBTITLE)).toBeInTheDocument();
  });

  it("renders project name input", () => {
    render(<StepInfo />);
    const input = screen.getByLabelText(new RegExp(UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_LABEL));
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders description textarea", () => {
    render(<StepInfo />);
    const textarea = screen.getByLabelText(
      new RegExp(UI_CONTENT.WIZARD.STEP_INFO.DESCRIPTION_LABEL)
    );
    expect(textarea).toBeInTheDocument();
  });

  it("renders target audience input", () => {
    render(<StepInfo />);
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.TARGET_AUDIENCE_LABEL)).toBeInTheDocument();
  });

  it("renders constraints textarea", () => {
    render(<StepInfo />);
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.CONSTRAINTS_LABEL)).toBeInTheDocument();
  });

  it("renders the next button disabled initially", () => {
    render(<StepInfo />);
    const nextButton = screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON).closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("shows progress counter at 0/2 initially", () => {
    render(<StepInfo />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("/2")).toBeInTheDocument();
  });

  // ======== Project Name Input ========

  it("updates project name on typing", () => {
    render(<StepInfo />);
    const input = screen.getByLabelText(new RegExp(UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_LABEL));
    fireEvent.change(input, { target: { value: "My Project" } });
    expect(mockStore.setProjectName).toHaveBeenCalledWith("My Project");
  });

  it("shows project name character counter", () => {
    render(<StepInfo />);
    const counters = screen.getAllByTestId("character-counter");
    expect(counters.length).toBeGreaterThanOrEqual(1);
  });

  it("shows clear button when project name has content", () => {
    mockStore.projectName = "My App";
    render(<StepInfo />);
    expect(
      screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_PROJECT_NAME)
    ).toBeInTheDocument();
  });

  it("clears project name when clear button clicked", () => {
    mockStore.projectName = "My App";
    render(<StepInfo />);
    const clearButton = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_PROJECT_NAME);
    fireEvent.click(clearButton);
    expect(mockStore.setProjectName).toHaveBeenCalledWith("");
  });

  // ======== Description Input ========

  it("updates description on typing", () => {
    render(<StepInfo />);
    const textarea = screen.getByLabelText(
      new RegExp(UI_CONTENT.WIZARD.STEP_INFO.DESCRIPTION_LABEL)
    );
    fireEvent.change(textarea, { target: { value: "A description" } });
    expect(mockStore.setDescription).toHaveBeenCalledWith("A description");
  });

  it("shows clear button when description has content", () => {
    mockStore.description = "Some description text";
    render(<StepInfo />);
    expect(
      screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_DESCRIPTION)
    ).toBeInTheDocument();
  });

  it("clears description when clear button clicked", () => {
    mockStore.description = "Some description";
    render(<StepInfo />);
    const clearButton = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_DESCRIPTION);
    fireEvent.click(clearButton);
    expect(mockStore.setDescription).toHaveBeenCalledWith("");
  });

  // ======== Target Audience ========

  it("shows optional label for target audience", () => {
    render(<StepInfo />);
    const optionalLabels = screen.getAllByText(UI_CONTENT.WIZARD.STEP_INFO.OPTIONAL_LABEL);
    expect(optionalLabels.length).toBeGreaterThanOrEqual(2);
  });

  it("updates target audience on typing", () => {
    render(<StepInfo />);
    const input = screen.getByLabelText(
      new RegExp(UI_CONTENT.WIZARD.STEP_INFO.TARGET_AUDIENCE_LABEL)
    );
    fireEvent.change(input, { target: { value: "Developers" } });
    expect(mockStore.setTargetAudience).toHaveBeenCalledWith("Developers");
  });

  it("shows clear button when target audience has content", () => {
    mockStore.targetAudience = "Developers";
    render(<StepInfo />);
    expect(
      screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_TARGET_AUDIENCE)
    ).toBeInTheDocument();
  });

  // ======== Constraints ========

  it("updates constraints on typing", () => {
    render(<StepInfo />);
    const textarea = screen.getByLabelText(
      new RegExp(UI_CONTENT.WIZARD.STEP_INFO.CONSTRAINTS_LABEL)
    );
    fireEvent.change(textarea, { target: { value: "Must be fast" } });
    expect(mockStore.setConstraints).toHaveBeenCalledWith("Must be fast");
  });

  it("shows clear button when constraints has content", () => {
    mockStore.constraints = "Must be fast";
    render(<StepInfo />);
    expect(
      screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_CONSTRAINTS)
    ).toBeInTheDocument();
  });

  // ======== Form Validation ========

  it("disables next button when project name is too short", () => {
    mockStore.projectName = ""; // Empty string is below FORM_LIMITS.PROJECT_NAME.MIN (1)
    mockStore.description = "Valid description that is long enough";
    render(<StepInfo />);
    const nextButton = screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON).closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("disables next button when description is too short", () => {
    mockStore.projectName = "Valid Project";
    mockStore.description = "Short"; // Below FORM_LIMITS.DESCRIPTION.MIN
    render(<StepInfo />);
    const nextButton = screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON).closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("enables next button when all required fields are valid", () => {
    mockStore.projectName = "My Project";
    mockStore.description =
      "A valid project description that meets the minimum length requirement.";
    render(<StepInfo />);
    const nextButton = screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON).closest("button");
    expect(nextButton).not.toBeDisabled();
  });

  it("updates progress when fields are filled", () => {
    mockStore.projectName = "My Project";
    mockStore.description = "A valid description for the project that is long enough.";
    render(<StepInfo />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("includes optional fields in progress count", () => {
    mockStore.projectName = "My Project";
    mockStore.description = "A valid description for the project that is long enough.";
    mockStore.targetAudience = "Developers";
    render(<StepInfo />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  // ======== Form Submission ========

  it("calls nextStep when submitted with valid form", () => {
    mockStore.projectName = "My Project";
    mockStore.description =
      "A valid project description that meets the minimum length requirement.";
    render(<StepInfo />);
    const form = screen.getByRole("button", {
      name: new RegExp(UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON),
    });
    fireEvent.click(form);
    expect(mockStore.nextStep).toHaveBeenCalledTimes(1);
  });

  it("does not call nextStep when submitted with invalid form", () => {
    render(<StepInfo />);
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
    if (form) {
      fireEvent.submit(form);
    }
    expect(mockStore.nextStep).not.toHaveBeenCalled();
  });

  // ======== Clear All Form ========

  it("shows clear all button when any field has content", () => {
    mockStore.projectName = "My Project";
    render(<StepInfo />);
    expect(
      screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_FIELDS)
    ).toBeInTheDocument();
  });

  it("does not show clear all button when all fields empty", () => {
    render(<StepInfo />);
    expect(
      screen.queryByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_FIELDS)
    ).not.toBeInTheDocument();
  });

  it("calls clearForm when clear all button is clicked", () => {
    mockStore.projectName = "My Project";
    render(<StepInfo />);
    const clearAllButton = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_FIELDS);
    fireEvent.click(clearAllButton);
    expect(mockStore.clearForm).toHaveBeenCalledTimes(1);
  });

  // ======== Character Limits ========

  it("shows approaching limit warning for long project names", () => {
    mockStore.projectName = "A".repeat(FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD + 1);
    render(<StepInfo />);
    expect(screen.getByText(VALIDATION_MESSAGES.APPROACHING_CHARACTER_LIMIT)).toBeInTheDocument();
  });

  it("shows character hint for short descriptions while typing", () => {
    mockStore.description = "Short"; // Below FORM_LIMITS.DESCRIPTION.MIN
    render(<StepInfo />);
    expect(
      screen.getByText(
        VALIDATION_MESSAGES.CHARACTERS_NEEDED(FORM_LIMITS.DESCRIPTION.MIN - "Short".length)
      )
    ).toBeInTheDocument();
    // The assertive error must not fire while the user is still typing.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not show description error before submit attempt", () => {
    mockStore.description = "Short";
    render(<StepInfo />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText(VALIDATION_MESSAGES.CHARACTERS_NEEDED(5))).toBeInTheDocument();
  });

  it("shows minimum length error for short descriptions after submit attempt", () => {
    mockStore.projectName = "My Project"; // Keep project name valid so description is the failing field
    mockStore.description = "Short";
    render(<StepInfo />);
    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent(
      VALIDATION_MESSAGES.DESCRIPTION_MIN_LENGTH(FORM_LIMITS.DESCRIPTION.MIN)
    );
    expect(screen.getByRole("textbox", { name: /Description/i })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("hides description error once the description becomes valid", () => {
    mockStore.projectName = "My Project"; // Keep project name valid so description is the failing field
    mockStore.description = "Short";
    render(<StepInfo />);
    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }
    expect(screen.getByRole("alert")).toBeInTheDocument();
    mockStore.description = "A valid description that is long enough";
    // Advance timers so the shake state change re-renders with the new value.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows error message and announces it when project name is invalid on submit", () => {
    render(<StepInfo />);
    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent(
      VALIDATION_MESSAGES.PROJECT_NAME_MIN_LENGTH(FORM_LIMITS.PROJECT_NAME.MIN)
    );
    expect(screen.getByLabelText(/Project Name/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("does not show project name error before submit attempt", () => {
    render(<StepInfo />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps project name error visible after the shake animation ends", () => {
    render(<StepInfo />);
    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent(
      VALIDATION_MESSAGES.PROJECT_NAME_MIN_LENGTH(FORM_LIMITS.PROJECT_NAME.MIN)
    );
    // Regression: error must persist past the 400ms shake (BUG-044).
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      VALIDATION_MESSAGES.PROJECT_NAME_MIN_LENGTH(FORM_LIMITS.PROJECT_NAME.MIN)
    );
    expect(screen.getByLabelText(/Project Name/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("hides project name error once the field becomes valid", () => {
    render(<StepInfo />);
    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }
    expect(screen.getByRole("alert")).toBeInTheDocument();
    mockStore.projectName = "valid-project";
    // Advance timers so the shake state change re-renders with the new value.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not re-show project name error after the field is cleared", () => {
    render(<StepInfo />);
    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }
    expect(screen.getByRole("alert")).toBeInTheDocument();
    // User types a valid name (error hides), then clears the field.
    mockStore.projectName = "ab";
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    mockStore.projectName = "";
    const clearButton = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_PROJECT_NAME);
    fireEvent.click(clearButton);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // ======== Screen Reader ========

  it("has live region for clear announcements", () => {
    mockStore.projectName = "My Project";
    render(<StepInfo />);
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute("aria-live", "assertive");
  });

  it("announces when form is cleared", () => {
    mockStore.projectName = "My Project";
    render(<StepInfo />);
    const clearAllButton = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_FIELDS);
    fireEvent.click(clearAllButton);
    expect(
      screen.getByText(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_ANNOUNCEMENT)
    ).toBeInTheDocument();
  });

  // ======== Edge Cases ========

  it("handles empty state gracefully", () => {
    render(<StepInfo />);
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.TITLE)).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders with direction prop", () => {
    render(<StepInfo direction="backward" />);
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.TITLE)).toBeInTheDocument();
  });
});
