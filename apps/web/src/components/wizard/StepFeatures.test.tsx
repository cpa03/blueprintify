/**
 * Tests for StepFeatures (Step 3: Feature Selection)
 *
 * Covers:
 * - Rendering basic structure (title, subtitle, input field)
 * - Adding custom features via text input
 * - Adding feature via Enter key
 * - Clear input button visibility
 * - Feature chip rendering for added features
 * - Removing individual features
 * - Clearing all features
 * - Adding individual suggestions
 * - "Add all suggestions" bulk operation
 * - Character limit enforcement
 * - Navigation (back/next buttons)
 * - Edge cases (empty state, duplicate suggestions)
 * - Accessibility labels
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { StepFeatures } from "./StepFeatures";
import { useWizardStore } from "../../store";
import type { WizardStore } from "../../store/wizard";
import { UI_CONTENT, FORM_LIMITS, SUGGESTED_FEATURES, TIMEOUTS } from "../../config/constants";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";

// Mock framer-motion to render plain HTML elements
vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    button: vi.fn(({ children, whileHover: _w1, whileTap: _w2, animate: _a, ...props }) => (
      <button {...props}>{children}</button>
    )),
    svg: vi.fn(({ children, ...props }) => <svg {...props}>{children}</svg>),
    path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  button: vi.fn(({ children, whileHover: _w1, whileTap: _w2, animate: _a, ...props }) => (
    <button {...props}>{children}</button>
  )),
  svg: vi.fn(({ children, ...props }) => <svg {...props}>{children}</svg>),
  path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
}));

// Mock platform utilities
vi.mock("../../lib/platform", () => ({
  getModifierLabel: () => "Ctrl",
  getAltKeyLabel: () => "Alt",
  getAriaShortcutKey: (_: string, mod: string) => `${mod}+ArrowLeft`,
}));

// Mock child components
vi.mock("../RippleButton", () => ({
  RippleButton: vi.fn(({ children, onClick, disabled, ariaLabel, className, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
}));

vi.mock("../SmartTooltip", () => ({
  KeyboardShortcutTooltip: vi.fn(
    ({ children, shortcut: _s, description: _d, position: _p, modifier: _m }) => <>{children}</>
  ),
}));

vi.mock("../CharacterCounter", () => ({
  CharacterCounterCompact: vi.fn(({ current, max }) => (
    <span data-testid="character-counter">
      {current}/{max}
    </span>
  )),
}));

// Mock the store
vi.mock("../../store", () => ({
  useWizardStore: vi.fn(),
}));

const createMockStore = (overrides: Partial<WizardStore> = {}): WizardStore => {
  const defaultStore: WizardStore = {
    currentStep: "features",
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
    setTargetAudience: vi.fn(),
    setConstraints: vi.fn(),
    reset: vi.fn(),
    loadTemplate: vi.fn(),
    ...overrides,
  };
  return defaultStore;
};

let mockStore: WizardStore;

describe("StepFeatures", () => {
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
    render(<StepFeatures />);
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_FEATURES.TITLE)).toBeInTheDocument();
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_FEATURES.SUBTITLE)).toBeInTheDocument();
  });

  it("renders the feature input field with placeholder", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute(
      "placeholder",
      UI_CONTENT.WIZARD.STEP_FEATURES.ADD_FEATURE_PLACEHOLDER
    );
  });

  it("shows feature count of 0 when no features added", () => {
    render(<StepFeatures />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_FEATURES.FEATURES_COUNT(0))).toBeInTheDocument();
  });

  it("renders the add feature button disabled initially", () => {
    render(<StepFeatures />);
    const addButton = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_FEATURE);
    expect(addButton).toBeDisabled();
  });

  it("renders suggestions section when features are empty", () => {
    render(<StepFeatures />);
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_FEATURES.QUICK_ADD_LABEL)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_ALL_SUGGESTIONS,
      })
    ).toBeInTheDocument();
  });

  it("does not render 'Your features' section when no features", () => {
    render(<StepFeatures />);
    expect(
      screen.queryByText(UI_CONTENT.WIZARD.STEP_FEATURES.YOUR_FEATURES_LABEL)
    ).not.toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    render(<StepFeatures />);
    expect(screen.getByText(UI_CONTENT.BUTTONS.BACK_TO_STACK)).toBeInTheDocument();
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_FEATURES.NEXT_BUTTON)).toBeInTheDocument();
  });

  // ======== Adding Features ========

  it("enables add button when text is entered", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME);
    fireEvent.change(input, { target: { value: "New Feature" } });
    const addButton = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_FEATURE);
    expect(addButton).toBeEnabled();
  });

  it("calls addFeature when add button is clicked", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME);
    fireEvent.change(input, { target: { value: "My Feature" } });
    const addButton = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_FEATURE);
    fireEvent.click(addButton);
    expect(mockStore.addFeature).toHaveBeenCalledWith("My Feature");
  });

  it("adds feature on Enter key press", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME);
    fireEvent.change(input, { target: { value: "Enter Feature" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockStore.addFeature).toHaveBeenCalledWith("Enter Feature");
  });

  it("does not call addFeature for empty or whitespace-only input", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME);
    // Whitespace only
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockStore.addFeature).not.toHaveBeenCalled();
  });

  it("clears input after adding a feature", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Temporary" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
  });

  it("trims whitespace from feature before adding", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME);
    fireEvent.change(input, { target: { value: "  Spaced Feature  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockStore.addFeature).toHaveBeenCalledWith("Spaced Feature");
  });

  // ======== Clear Input Button ========

  it("shows clear input button when text is entered", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME);
    fireEvent.change(input, { target: { value: "Some text" } });
    expect(
      screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.CLEAR_FEATURE_INPUT)
    ).toBeInTheDocument();
  });

  it("clears input when clear button is clicked", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Clear me" } });
    const clearButton = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.CLEAR_FEATURE_INPUT
    );
    fireEvent.click(clearButton);
    expect(input.value).toBe("");
  });

  // ======== Feature Chips Display ========

  it("displays added features as chips", () => {
    mockStore.features = ["User auth", "API", "Database"];
    render(<StepFeatures />);
    expect(screen.getByText("User auth")).toBeInTheDocument();
    expect(screen.getByText("API")).toBeInTheDocument();
    expect(screen.getByText("Database")).toBeInTheDocument();
  });

  it("shows 'Your features' section when features exist", () => {
    mockStore.features = ["Auth"];
    render(<StepFeatures />);
    expect(
      screen.getByText(`${UI_CONTENT.WIZARD.STEP_FEATURES.YOUR_FEATURES_LABEL} (1)`)
    ).toBeInTheDocument();
  });

  it("shows correct feature count with multiple features", () => {
    mockStore.features = ["A", "B", "C"];
    render(<StepFeatures />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(UI_CONTENT.WIZARD.STEP_FEATURES.FEATURES_COUNT(3))).toBeInTheDocument();
  });

  // ======== Removing Features ========

  it("calls removeFeature when remove button is clicked on a feature", () => {
    mockStore.features = ["Auth", "API"];
    render(<StepFeatures />);
    const removeButton = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.REMOVE_FEATURE("Auth")
    );
    fireEvent.click(removeButton);
    expect(mockStore.removeFeature).toHaveBeenCalledWith("Auth");
  });

  // ======== Clear All Features ========

  it("calls clearFeatures when clear all button is clicked", () => {
    mockStore.features = ["Auth", "API", "DB"];
    render(<StepFeatures />);
    const clearAllButton = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.CLEAR_ALL_FEATURES
    );
    fireEvent.click(clearAllButton);
    expect(mockStore.clearFeatures).toHaveBeenCalledTimes(1);
  });

  // ======== Suggestions ========

  it("displays suggestion chips when suggestions remain", () => {
    mockStore.features = [];
    render(<StepFeatures />);
    // Should show all suggestions
    for (const suggestion of SUGGESTED_FEATURES) {
      expect(
        screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_SUGGESTION(suggestion))
      ).toBeInTheDocument();
    }
  });

  it("hides suggestions that have already been added", () => {
    mockStore.features = ["User authentication"];
    render(<StepFeatures />);
    // "User authentication" should be hidden as a suggestion
    expect(
      screen.queryByLabelText(
        ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_SUGGESTION("User authentication")
      )
    ).not.toBeInTheDocument();
    // Other suggestions should still appear
    expect(
      screen.getByLabelText(
        ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_SUGGESTION("Database integration")
      )
    ).toBeInTheDocument();
  });

  it("calls addFeature when a suggestion is clicked", () => {
    mockStore.features = [];
    render(<StepFeatures />);
    const suggestionButton = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_SUGGESTION(SUGGESTED_FEATURES[0])
    );
    fireEvent.click(suggestionButton);
    expect(mockStore.addFeature).toHaveBeenCalledWith(SUGGESTED_FEATURES[0]);
  });

  it("calls addFeature when suggestion is activated via Enter key", () => {
    mockStore.features = [];
    render(<StepFeatures />);
    const suggestionButton = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_SUGGESTION(SUGGESTED_FEATURES[0])
    );
    fireEvent.keyDown(suggestionButton, { key: "Enter" });
    expect(mockStore.addFeature).toHaveBeenCalledWith(SUGGESTED_FEATURES[0]);
  });

  it("calls addFeature when suggestion is activated via Space key", () => {
    mockStore.features = [];
    render(<StepFeatures />);
    const suggestionButton = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_SUGGESTION(SUGGESTED_FEATURES[0])
    );
    fireEvent.keyDown(suggestionButton, { key: " " });
    expect(mockStore.addFeature).toHaveBeenCalledWith(SUGGESTED_FEATURES[0]);
  });

  // ======== Add All Suggestions ========

  it("calls addFeature for all remaining suggestions when 'Add all' is clicked", () => {
    mockStore.features = [];
    render(<StepFeatures />);
    const addAllButton = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_ALL_SUGGESTIONS
    );
    fireEvent.click(addAllButton);
    for (const suggestion of SUGGESTED_FEATURES) {
      expect(mockStore.addFeature).toHaveBeenCalledWith(suggestion);
    }
    expect(mockStore.addFeature).toHaveBeenCalledTimes(SUGGESTED_FEATURES.length);
  });

  it("calls addFeature only for suggestions not already added", () => {
    mockStore.features = ["User authentication", "Database integration"];
    render(<StepFeatures />);
    const addAllButton = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_ALL_SUGGESTIONS
    );
    fireEvent.click(addAllButton);
    // Should NOT have called for already-added features
    expect(mockStore.addFeature).not.toHaveBeenCalledWith("User authentication");
    expect(mockStore.addFeature).not.toHaveBeenCalledWith("Database integration");
    // Should have called for remaining suggestions
    expect(mockStore.addFeature).toHaveBeenCalledWith("API endpoints");
    expect(mockStore.addFeature).toHaveBeenCalledWith("Real-time updates");
  });

  it("shows 'All added!' message temporarily after add all", async () => {
    mockStore.features = [];
    render(<StepFeatures />);
    const addAllButton = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_ALL_SUGGESTIONS
    );

    fireEvent.click(addAllButton);

    // Should show "All added!"
    expect(
      screen.getByText(UI_CONTENT.WIZARD.STEP_FEATURES.ALL_SUGGESTIONS_ADDED)
    ).toBeInTheDocument();

    // After timeout, message should disappear.
    act(() => {
      vi.runAllTimers();
    });
    expect(
      screen.queryByText(UI_CONTENT.WIZARD.STEP_FEATURES.ALL_SUGGESTIONS_ADDED)
    ).not.toBeInTheDocument();
  });

  // ======== Character Limit ========

  it("enforces maximum feature length", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(
      ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME
    ) as HTMLInputElement;

    const longText = "a".repeat(FORM_LIMITS.FEATURE.MAX + 50);
    fireEvent.change(input, { target: { value: longText } });
    expect(input.value.length).toBe(FORM_LIMITS.FEATURE.MAX);
  });

  it("shows character counter", () => {
    render(<StepFeatures />);
    const input = screen.getByLabelText(ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME);
    fireEvent.change(input, { target: { value: "Hello" } });
    expect(screen.getByTestId("character-counter")).toBeInTheDocument();
  });

  // ======== Navigation ========

  it("calls prevStep when back button is clicked", () => {
    render(<StepFeatures />);
    const backButton = screen.getByText(UI_CONTENT.BUTTONS.BACK_TO_STACK);
    fireEvent.click(backButton);
    expect(mockStore.prevStep).toHaveBeenCalledTimes(1);
  });

  it("calls nextStep when next button is clicked", () => {
    render(<StepFeatures />);
    const nextButton = screen.getByText(UI_CONTENT.WIZARD.STEP_FEATURES.NEXT_BUTTON);
    fireEvent.click(nextButton);
    expect(mockStore.nextStep).toHaveBeenCalledTimes(1);
  });

  // ======== Edge Cases ========

  it("handles many features gracefully", () => {
    mockStore.features = Array.from({ length: 50 }, (_, i) => `Feature ${i}`);
    render(<StepFeatures />);
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("Feature 0")).toBeInTheDocument();
    expect(screen.getByText("Feature 49")).toBeInTheDocument();
  });

  it("does not show suggestions section when all suggestions are added", () => {
    mockStore.features = [...SUGGESTED_FEATURES];
    render(<StepFeatures />);
    expect(
      screen.queryByText(UI_CONTENT.WIZARD.STEP_FEATURES.QUICK_ADD_LABEL)
    ).not.toBeInTheDocument();
  });
});
