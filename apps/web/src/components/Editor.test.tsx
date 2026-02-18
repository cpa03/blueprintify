import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { Editor } from "./Editor";
import { useEditorStore, useWizardStore } from "../store";
import type { EditorStore } from "../store/editor";
import type { WizardStore } from "../store/wizard";

vi.mock("../store", () => ({
  useEditorStore: vi.fn(),
  useWizardStore: vi.fn(),
  resetAllStores: vi.fn(),
  useToast: vi.fn(() => ({
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock("./editor/EditorHeader", () => ({
  EditorHeader: vi.fn(() => (
    <div data-testid="editor-header">
      <div data-testid="copy-button">Copy</div>
      <div data-testid="export-button">Export</div>
      <div data-testid="new-button">New</div>
    </div>
  )),
}));

vi.mock("./LazyCodeMirror", () => ({
  LazyCodeMirror: vi.fn(({ value }) => (
    <textarea data-testid="codemirror" value={value} readOnly />
  )),
}));

vi.mock("./LazyMarkdownRenderer", () => ({
  LazyMarkdownRenderer: vi.fn(({ content }) => (
    <div data-testid="markdown-preview">{content}</div>
  )),
}));

vi.mock("../lib/export", () => ({
  exportAsZip: vi.fn(),
  copyToClipboard: vi.fn(),
  formatForIDE: vi.fn((content) => content),
}));

vi.mock("../config/constants", () => ({
  TIMEOUTS: {
    COPY_FEEDBACK: 2000,
  },
  ANIMATION: {
    FAST: 0.15,
    NORMAL: 0.2,
    MEDIUM: 0.3,
    SLOW: 0.5,
    STAGGER: 0.1,
    SPINNER_ROTATION: 1,
    TYPING_INDICATOR_DELAY_S: 0.6,
  },
  DEFAULT_PROJECT_NAME: "Test Project",
  WIZARD_STEPS: [
    { key: "info", label: "Project Info", icon: "📝", shortcut: "1" },
    { key: "stack", label: "Tech Stack", icon: "⚙️", shortcut: "2" },
    { key: "features", label: "Features", icon: "✨", shortcut: "3" },
    { key: "review", label: "Review", icon: "👀", shortcut: "4" },
    { key: "generating", label: "Generate", icon: "🚀", shortcut: "5" },
  ],
}));

const mockEditorStore: EditorStore = {
  activeTab: "blueprint",
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

const mockWizardStore: WizardStore = {
  currentStep: "info" as const,
  projectName: "Test Project",
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

describe("Editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useEditorStore as unknown as Mock).mockImplementation(
      (selector: (state: EditorStore) => unknown) => selector(mockEditorStore),
    );
    (useWizardStore as unknown as Mock).mockImplementation(
      (selector: (state: WizardStore) => unknown) => selector(mockWizardStore),
    );
  });

  it("renders empty state when no content and not generating", () => {
    render(<Editor />);
    expect(
      screen.getByText("Your blueprint is waiting to be created"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Complete the wizard steps to generate your project documentation",
      ),
    ).toBeInTheDocument();
  });

  it("renders editor header", () => {
    render(<Editor />);
    expect(screen.getByTestId("editor-header")).toBeInTheDocument();
    expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
    expect(screen.getByTestId("new-button")).toBeInTheDocument();
  });

  it("renders CodeMirror and preview when content exists", () => {
    mockEditorStore.blueprintContent = "# Test Content";
    render(<Editor />);

    expect(screen.getByTestId("codemirror")).toBeInTheDocument();
    expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
    expect(screen.getByDisplayValue("# Test Content")).toBeInTheDocument();
  });

  it("displays tasks content when tasks tab is active", () => {
    mockEditorStore.activeTab = "tasks";
    mockEditorStore.tasksContent = "# Tasks Content";
    render(<Editor />);

    expect(screen.getByDisplayValue("# Tasks Content")).toBeInTheDocument();
  });

  it("has proper styling classes", () => {
    mockEditorStore.blueprintContent = "# Test Content";
    const { container } = render(<Editor />);

    const editorContainer = container.firstChild;
    expect(editorContainer).toHaveClass("h-full", "flex", "flex-col");
  });
});
