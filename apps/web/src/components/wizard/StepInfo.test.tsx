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
import { UI_CONTENT, FORM_LIMITS, VALIDATION_MESSAGES, TIMEOUTS } from "../../config/constants";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";

// Mock framer-motion to render plain HTML elements
vi.mock("framer-motion", () => {
  const createMotion = (Component: string) =>
    vi.fn(
      ({
        children,
        whileHover: _whileHover,
        whileTap: _whileTap,
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        layout: _layout,
        layoutId: _layoutId,
        ...props
      }: Record<string, unknown> & { children?: React.ReactNode }) => {
        const Tag = Component as keyof JSX.IntrinsicElements;
        return <Tag {...(props as Record<string, unknown>)}>{children ?? null}</Tag>;
      }
    );
  return {
    motion: {
      div: createMotion("div"),
      span: createMotion("span"),
      button: createMotion("button"),
      input: createMotion("input"),
      textarea: createMotion("textarea"),
      p: createMotion("p"),
      svg: createMotion("svg"),
      path: createMotion("path"),
    },
    AnimatePresence: vi.fn(({ children }) => <>{children}</>),
  };
});

vi.mock("framer-motion/m", () => {
  const createMotion = (Component: string) =>
    vi.fn(
      ({
        children,
        whileHover: _whileHover,
        whileTap: _whileTap,
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        layout: _layout,
        layoutId: _layoutId,
        ...props
      }: Record<string, unknown> & { children?: React.ReactNode }) => {
        const Tag = Component as keyof JSX.IntrinsicElements;
        return <Tag {...(props as Record<string, unknown>)}>{children ?? null}</Tag>;
      }
    );
  return {
    div: createMotion("div"),
    span: createMotion("span"),
    button: createMotion("button"),
    input: createMotion("input"),
    textarea: createMotion("textarea"),
    p: createMotion("p"),
    svg: createMotion("svg"),
    path: createMotion("path"),
  };
});

// Mock platform utilities
vi.mock("../../lib/platform", () => ({
  getModifierLabel: () => "Ctrl",
  getAltKeyLabel: () => "Alt",
  getAriaShortcutKey: (_: string, mod: string) => `${mod}+Enter`,
}));

// Mock child components
vi.mock("../RippleButton", () => ({
  RippleButton: vi.fn(
    ({ children, onClick, disabled, type, whileHover: _wH, whileTap: _wT, ...props }) => (
      <button onClick={onClick} disabled={disabled} type={type} {...props}>
        {children}
      </button>
    )
  ),
}));

vi.mock("../SmartTooltip", () => ({
  KeyboardShortcutTooltip: vi.fn(({ children, shortcut: _s, description: _d, position: _p }) => (
    <>{children}</>
  )),
  SmartTooltip: vi.fn(({ children, content }) => (
    <>
      {children}
      <span data-testid="disabled-tooltip">{content}</span>
    </>
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
    flushStorage: vi.fn(),
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

  // ======== Basic Rendering & DOM State Tracking ========

  it("sets data-reduced-motion and data-can-proceed attributes on root container", () => {
    mockStore.projectName = "My Project";
    mockStore.description = "A sufficiently long description that meets minimum requirements.";
    render(<StepInfo />);
    const rootContainer = screen
      .getByText(UI_CONTENT.WIZARD.STEP_INFO.TITLE)
      .closest("div[data-reduced-motion]");
    expect(rootContainer).toHaveAttribute("data-reduced-motion", "false");
    expect(rootContainer).toHaveAttribute("data-can-proceed", "true");
  });

  it("sets data-can-proceed to false when form is incomplete", () => {
    render(<StepInfo />);
    const rootContainer = screen
      .getByText(UI_CONTENT.WIZARD.STEP_INFO.TITLE)
      .closest("div[data-reduced-motion]");
    expect(rootContainer).toHaveAttribute("data-reduced-motion", "false");
    expect(rootContainer).toHaveAttribute("data-can-proceed", "false");
  });

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

  it("explains why the next button is disabled via aria-label", () => {
    render(<StepInfo />);
    const nextButton = screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON).closest("button");
    expect(nextButton).toHaveAttribute(
      "aria-label",
      ACCESSIBILITY_LABELS.WIZARD_INFO.NEXT_DISABLED_ARIA
    );
  });

  it("shows the disabled-explanation tooltip when the form is incomplete", () => {
    render(<StepInfo />);
    expect(screen.getByTestId("disabled-tooltip")).toHaveTextContent(
      ACCESSIBILITY_LABELS.WIZARD_INFO.NEXT_DISABLED_TOOLTIP
    );
  });

  it("omits the disabled-explanation aria-label when the form is valid", () => {
    mockStore.projectName = "My Project";
    mockStore.description = "A sufficiently long description";
    render(<StepInfo />);
    const nextButton = screen.getByText(UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON).closest("button");
    expect(nextButton).not.toBeDisabled();
    expect(nextButton).not.toHaveAttribute("aria-label");
  });

  it("shows progress counter at 0/2 initially", () => {
    render(<StepInfo />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("/2")).toBeInTheDocument();
  });

  it("exposes form completion bar as a progressbar with value semantics", () => {
    render(<StepInfo />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "2");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
    expect(progressbar).toHaveAttribute(
      "aria-label",
      ACCESSIBILITY_LABELS.WIZARD_INFO.FIELDS_COMPLETED(0, 2)
    );
  });

  it("updates progressbar aria-valuenow when required fields are filled", () => {
    mockStore.projectName = "My Project";
    mockStore.description = "A valid description for the project that is long enough.";
    render(<StepInfo />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "2");
    expect(progressbar).toHaveAttribute(
      "aria-label",
      ACCESSIBILITY_LABELS.WIZARD_INFO.FIELDS_COMPLETED(2, 2)
    );
  });

  it("announces field completion via a polite live region separate from the bar", () => {
    mockStore.projectName = "My Project";
    render(<StepInfo />);
    const liveRegion = screen.getByText(ACCESSIBILITY_LABELS.WIZARD_INFO.FIELDS_COMPLETED(1, 2));
    expect(liveRegion).toHaveAttribute("role", "status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    // Live region must not be the progressbar itself (progressbars are not live).
    expect(liveRegion).not.toHaveAttribute("role", "progressbar");
  });

  // ======== Project Name Input ========

  it("updates project name on typing", () => {
    render(<StepInfo />);
    const input = screen.getByLabelText(new RegExp(UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_LABEL));
    fireEvent.change(input, { target: { value: "My Project" } });
    expect(mockStore.setProjectName).toHaveBeenCalledWith("My Project");
  });

  it("disables mobile autocapitalize/autocorrect/spellcheck on project name", () => {
    render(<StepInfo />);
    const input = screen.getByLabelText(new RegExp(UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_LABEL));
    expect(input).toHaveAttribute("autocapitalize", "off");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("spellcheck", "false");
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

  it("turns project name border yellow when approaching the character limit", () => {
    mockStore.projectName = "A".repeat(FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD + 1);
    render(<StepInfo />);
    const input = screen.getByRole("textbox", { name: /Project Name/i });
    expect(input.className).toContain("border-yellow-500");
  });

  it("shows approaching limit warning for long descriptions", () => {
    mockStore.description = "A".repeat(FORM_LIMITS.DESCRIPTION.MAX - 1);
    render(<StepInfo />);
    expect(screen.getByText(VALIDATION_MESSAGES.APPROACHING_CHARACTER_LIMIT)).toBeInTheDocument();
  });

  it("turns description border yellow when approaching the character limit", () => {
    mockStore.description = "A".repeat(FORM_LIMITS.DESCRIPTION.MAX - 1);
    render(<StepInfo />);
    const textarea = screen.getByRole("textbox", { name: /Description/i });
    expect(textarea.className).toContain("border-yellow-500");
    expect(textarea).toHaveAttribute("aria-describedby", "description-warning");
  });

  it("keeps below-minimum description hint neutral instead of warning yellow", () => {
    mockStore.description = "Short"; // Below FORM_LIMITS.DESCRIPTION.MIN
    render(<StepInfo />);
    const hint = screen.getByText(
      VALIDATION_MESSAGES.CHARACTERS_NEEDED(FORM_LIMITS.DESCRIPTION.MIN - "Short".length)
    );
    expect(hint.className).toContain("text-dark-400");
    expect(hint.className).not.toContain("text-yellow-500");
    const textarea = screen.getByRole("textbox", { name: /Description/i });
    expect(textarea.className).not.toContain("border-yellow-500");
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
    expect(error).toHaveTextContent("Project name must be at least 1 character");
    expect(error.textContent).not.toContain("1 characters");
    expect(screen.getByRole("textbox", { name: /Project Name/i })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
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
    expect(screen.getByRole("textbox", { name: /Project Name/i })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
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
    const assertiveRegion = screen
      .getAllByRole("status")
      .find((region) => region.getAttribute("aria-live") === "assertive");
    expect(assertiveRegion).toBeInTheDocument();
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

  // ======== Form-Ready Announcement (SR parity with ready pulse) ========

  it("has a polite live region for the form-ready announcement", () => {
    render(<StepInfo />);
    const announcer = screen.getByTestId("form-ready-announcer");
    expect(announcer).toHaveAttribute("role", "status");
    expect(announcer).toHaveAttribute("aria-live", "polite");
    expect(announcer).toHaveAttribute("aria-atomic", "true");
    expect(announcer).toBeEmptyDOMElement();
  });

  it("announces form-ready when the form transitions from incomplete to complete", () => {
    const { rerender } = render(<StepInfo />);
    expect(screen.getByTestId("form-ready-announcer")).toBeEmptyDOMElement();
    mockStore.projectName = "My Project";
    mockStore.description = "A sufficiently long description that meets the minimum length.";
    // StepInfo is memoized; change direction prop to force a re-render so the
    // canProceed transition effect runs (identical props would be skipped).
    rerender(<StepInfo direction="backward" />);
    expect(screen.getByTestId("form-ready-announcer")).toHaveTextContent(
      ACCESSIBILITY_LABELS.WIZARD_INFO.FORM_READY_ANNOUNCEMENT
    );
  });

  it("does not re-announce form-ready when already complete on mount", () => {
    mockStore.projectName = "My Project";
    mockStore.description = "A sufficiently long description that meets the minimum length.";
    render(<StepInfo />);
    expect(screen.getByTestId("form-ready-announcer")).toBeEmptyDOMElement();
  });

  it("clears the form-ready announcement after the live-region timeout", () => {
    const { rerender } = render(<StepInfo />);
    mockStore.projectName = "My Project";
    mockStore.description = "A sufficiently long description that meets the minimum length.";
    rerender(<StepInfo direction="backward" />);
    expect(screen.getByTestId("form-ready-announcer")).toHaveTextContent(
      ACCESSIBILITY_LABELS.WIZARD_INFO.FORM_READY_ANNOUNCEMENT
    );
    act(() => {
      vi.advanceTimersByTime(TIMEOUTS.LIVE_REGION_CLEAR + 100);
    });
    expect(screen.getByTestId("form-ready-announcer")).toBeEmptyDOMElement();
  });

  // ======== Enter-to-Advance ========

  it("moves focus from project name to description on Enter when form not submittable", () => {
    mockStore.projectName = "My Project";
    mockStore.description = ""; // Required field empty → form cannot submit
    render(<StepInfo />);
    const input = screen.getByLabelText(new RegExp(UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_LABEL));
    const description = screen.getByLabelText(
      new RegExp(UI_CONTENT.WIZARD.STEP_INFO.DESCRIPTION_LABEL)
    );
    fireEvent.keyDown(input, { key: "Enter" });
    expect(description).toHaveFocus();
  });

  it("moves focus from target audience to constraints on Enter when form not submittable", () => {
    mockStore.projectName = "My Project";
    mockStore.description = ""; // Required field empty → form cannot submit
    render(<StepInfo />);
    const input = screen.getByLabelText(
      new RegExp(UI_CONTENT.WIZARD.STEP_INFO.TARGET_AUDIENCE_LABEL)
    );
    const constraints = screen.getByLabelText(
      new RegExp(UI_CONTENT.WIZARD.STEP_INFO.CONSTRAINTS_LABEL)
    );
    fireEvent.keyDown(input, { key: "Enter" });
    expect(constraints).toHaveFocus();
  });

  it("does not move focus on Enter when the form is submittable", () => {
    mockStore.projectName = "My Project";
    mockStore.description =
      "A valid project description that meets the minimum length requirement.";
    render(<StepInfo />);
    const input = screen.getByLabelText(new RegExp(UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_LABEL));
    const description = screen.getByLabelText(
      new RegExp(UI_CONTENT.WIZARD.STEP_INFO.DESCRIPTION_LABEL)
    );
    fireEvent.keyDown(input, { key: "Enter" });
    expect(description).not.toHaveFocus();
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
