import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { Wizard } from "./Wizard";
import { useWizardStore, useEditorStore } from "../store";
import type { WizardStore } from "../store/wizard";
import type { EditorStore } from "../store/editor";
import { EDITOR_TABS } from "../config/constants";

vi.mock("../store", () => ({
  useWizardStore: vi.fn(),
  useEditorStore: vi.fn(),
}));

const mockUseDocumentTitle = vi.fn();
vi.mock("./hooks/useDocumentTitle", () => ({
  useDocumentTitle: mockUseDocumentTitle,
}));

vi.mock("./wizard/StepInfo", () => ({
  StepInfo: () => <div data-testid="step-info">Step Info</div>,
}));

vi.mock("./wizard/StepStack", () => ({
  StepStack: () => <div data-testid="step-stack">Step Stack</div>,
}));

vi.mock("./wizard/StepFeatures", () => ({
  StepFeatures: () => <div data-testid="step-features">Step Features</div>,
}));

vi.mock("./wizard/StepReview", () => ({
  StepReview: () => <div data-testid="step-review">Step Review</div>,
}));

vi.mock("./wizard/StepGenerating", () => ({
  StepGenerating: () => <div data-testid="step-generating">Step Generating</div>,
}));

vi.mock("../../hooks/useDocumentTitle", () => ({
  useDocumentTitle: vi.fn(),
}));

vi.mock("../wizard/StepInfo", () => ({
  StepInfo: () => <div data-testid="step-info">Step Info</div>,
}));

vi.mock("../wizard/StepStack", () => ({
  StepStack: () => <div data-testid="step-stack">Step Stack</div>,
}));

vi.mock("../wizard/StepFeatures", () => ({
  StepFeatures: () => <div data-testid="step-features">Step Features</div>,
}));

vi.mock("../wizard/StepReview", () => ({
  StepReview: () => <div data-testid="step-review">Step Review</div>,
}));

vi.mock("../wizard/StepGenerating", () => ({
  StepGenerating: () => <div data-testid="step-generating">Step Generating</div>,
}));

const mockWizardStore: WizardStore = {
  currentStep: "info" as const,
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
};

const mockEditorStore: EditorStore = {
  activeTab: EDITOR_TABS.BLUEPRINT,
  blueprintContent: "",
  tasksContent: "",
  isDirty: false,
  isGenerating: false,
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
};

describe("Wizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useWizardStore as unknown as Mock).mockImplementation(
      (selector: (state: WizardStore) => unknown) => selector(mockWizardStore)
    );
    (useEditorStore as unknown as Mock).mockImplementation(
      (selector: (state: EditorStore) => unknown) => selector(mockEditorStore)
    );
  });

  it("renders StepInfo when currentStep is info", async () => {
    render(<Wizard />);
    expect(await screen.findByTestId("step-info")).toBeInTheDocument();
    expect(screen.queryByTestId("step-stack")).not.toBeInTheDocument();
  });

  it("renders StepStack when currentStep is stack", async () => {
    mockWizardStore.currentStep = "stack";
    render(<Wizard />);
    expect(await screen.findByTestId("step-stack")).toBeInTheDocument();
    expect(screen.queryByTestId("step-info")).not.toBeInTheDocument();
  });

  it("renders StepFeatures when currentStep is features", async () => {
    mockWizardStore.currentStep = "features";
    render(<Wizard />);
    expect(await screen.findByTestId("step-features")).toBeInTheDocument();
  });

  it("renders StepReview when currentStep is review", async () => {
    mockWizardStore.currentStep = "review";
    render(<Wizard />);
    expect(await screen.findByTestId("step-review")).toBeInTheDocument();
  });

  it("renders StepGenerating when currentStep is generating", async () => {
    mockWizardStore.currentStep = "generating";
    render(<Wizard />);
    expect(await screen.findByTestId("step-generating")).toBeInTheDocument();
  });

  it("renders StepInfo as default for unknown steps", async () => {
    mockWizardStore.currentStep = "unknown" as WizardStore["currentStep"];
    render(<Wizard />);
    expect(await screen.findByTestId("step-info")).toBeInTheDocument();
  });

  it("has proper styling classes", () => {
    const { container } = render(<Wizard />);
    const wizardWrapper = container.firstChild;
    expect(wizardWrapper).toHaveClass("relative", "flex", "h-full");
    const scrollContainer = wizardWrapper?.childNodes[1];
    expect(scrollContainer).toHaveClass("flex-1", "overflow-y-auto", "p-6");
  });
});
