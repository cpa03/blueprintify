import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { axe } from "jest-axe";
import { Editor } from "./Editor";
import { LazyCodeMirror } from "./LazyCodeMirror";
import { useEditorStore, useWizardStore } from "../store";
import { ExportProvider } from "../context/ExportContext";
import { exportAsZip } from "../lib/export";
import type { EditorStore } from "../store/editor";
import type { WizardStore } from "../store/wizard";
import type { TechStackItemType } from "@blueprint/shared/types";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";
import { EDITOR_TABS, SCROLL_BEHAVIOR } from "../config/constants";

// jsdom cannot compute real colors, so the color-contrast rule is always
// "incomplete" there; disable it to focus on structural accessibility.
// Matches the Header.test.tsx and accessibility.test.tsx axe setup.
const AXE_CONFIG = {
  rules: { "color-contrast": { enabled: false } },
};

const { mockToast } = vi.hoisted(() => ({
  mockToast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../store", () => ({
  useEditorStore: vi.fn(),
  useWizardStore: vi.fn(),
  resetAllStores: vi.fn(),
  useToast: vi.fn(() => mockToast),
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
  LazyCodeMirror: vi.fn(({ value }: { value: string }) => (
    <textarea data-testid="codemirror" aria-label="Blueprint editor" value={value} readOnly />
  )),
}));

vi.mock("./LazyMarkdownRenderer", () => ({
  LazyMarkdownRenderer: vi.fn(({ content }: { content: string }) => (
    <div data-testid="markdown-preview">{content}</div>
  )),
}));

vi.mock("../lib/export", () => ({
  exportAsZip: vi.fn(),
  copyToClipboard: vi.fn(),
  formatForIDE: vi.fn((content: string) => content),
}));

vi.mock("../context/ExportContext", () => ({
  useExportContext: vi.fn(() => ({
    getExportMetadata: vi.fn(() => ({
      projectName: "Test Project",
      description: "",
      techStack: [] as TechStackItemType[],
      features: [],
    })),
  })),
  ExportProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../config/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../config/constants")>();
  const { WIZARD_STEP_KEYS } = await import("@blueprint/shared");
  return {
    ...actual,
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
      { key: WIZARD_STEP_KEYS.INFO, label: "Project Info", icon: "📝", shortcut: "1" },
      { key: WIZARD_STEP_KEYS.STACK, label: "Tech Stack", icon: "⚙️", shortcut: "2" },
      { key: WIZARD_STEP_KEYS.FEATURES, label: "Features", icon: "✨", shortcut: "3" },
      { key: WIZARD_STEP_KEYS.REVIEW, label: "Review", icon: "👀", shortcut: "4" },
      { key: WIZARD_STEP_KEYS.GENERATING, label: "Generate", icon: "🚀", shortcut: "5" },
    ],
    UI: {
      SCROLL_TO_TOP_THRESHOLD: 600,
    },
  };
});

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

const mockWizardStore: WizardStore = {
  currentStep: WIZARD_STEP_KEYS.INFO,
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
  clearForm: vi.fn(),
  setTargetAudience: vi.fn(),
  setConstraints: vi.fn(),
  reset: vi.fn(),
  loadTemplate: vi.fn(),
  flushStorage: vi.fn(),
};

describe("Editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useEditorStore as unknown as Mock & { getState: () => EditorStore }).mockImplementation(
      (selector: (state: EditorStore) => unknown) => selector(mockEditorStore)
    );
    (useEditorStore as unknown as Mock & { getState: () => EditorStore }).getState = () =>
      mockEditorStore;
    (useWizardStore as unknown as Mock & { getState: () => WizardStore }).mockImplementation(
      (selector: (state: WizardStore) => unknown) => selector(mockWizardStore)
    );
    (useWizardStore as unknown as Mock & { getState: () => WizardStore }).getState = () =>
      mockWizardStore;
  });

  it("renders empty state when no content and not generating", () => {
    render(
      <ExportProvider>
        <Editor />
      </ExportProvider>
    );
    expect(screen.getByText("Your blueprint is waiting to be created")).toBeInTheDocument();
    expect(
      screen.getByText("Complete the wizard steps to generate your project documentation")
    ).toBeInTheDocument();
  });

  it("renders editor header", () => {
    render(
      <ExportProvider>
        <Editor />
      </ExportProvider>
    );
    expect(screen.getByTestId("editor-header")).toBeInTheDocument();
    expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
    expect(screen.getByTestId("new-button")).toBeInTheDocument();
  });

  it("renders CodeMirror and preview when content exists", () => {
    mockEditorStore.blueprintContent = "# Test Content";
    render(
      <ExportProvider>
        <Editor />
      </ExportProvider>
    );

    expect(screen.getByTestId("codemirror")).toBeInTheDocument();
    expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
    expect(screen.getByDisplayValue("# Test Content")).toBeInTheDocument();
  });

  it("displays tasks content when tasks tab is active", () => {
    mockEditorStore.activeTab = EDITOR_TABS.TASKS;
    mockEditorStore.tasksContent = "# Tasks Content";
    render(
      <ExportProvider>
        <Editor />
      </ExportProvider>
    );

    expect(screen.getByDisplayValue("# Tasks Content")).toBeInTheDocument();
  });

  it("passes a per-tab accessible name to the markdown editor", () => {
    mockEditorStore.blueprintContent = "# Test Content";
    mockEditorStore.activeTab = EDITOR_TABS.BLUEPRINT;
    const { unmount } = render(
      <ExportProvider>
        <Editor />
      </ExportProvider>
    );

    const blueprintCall = (LazyCodeMirror as unknown as Mock).mock.calls.at(-1)?.[0];
    expect(blueprintCall).toMatchObject({ ariaLabel: "Blueprint markdown editor" });

    unmount();

    mockEditorStore.activeTab = EDITOR_TABS.TASKS;
    mockEditorStore.tasksContent = "# Tasks Content";
    render(
      <ExportProvider>
        <Editor />
      </ExportProvider>
    );

    const tasksCall = (LazyCodeMirror as unknown as Mock).mock.calls.at(-1)?.[0];
    expect(tasksCall).toMatchObject({ ariaLabel: "Tasks markdown editor" });
  });

  it("has proper styling classes", () => {
    mockEditorStore.blueprintContent = "# Test Content";
    const { container } = render(
      <ExportProvider>
        <Editor />
      </ExportProvider>
    );

    const editorContainer = container.firstChild;
    expect(editorContainer).toHaveClass("h-full", "flex", "flex-col");
  });

  it("has no accessibility violations", async () => {
    mockEditorStore.blueprintContent = "# Test Content";
    const { container } = render(
      <ExportProvider>
        <Editor />
      </ExportProvider>
    );

    const results = await axe(container, AXE_CONFIG);
    expect(results.violations).toHaveLength(0);
  });

  describe("Ctrl/Cmd+Shift+E export shortcut", () => {
    beforeEach(() => {
      mockEditorStore.blueprintContent = "# Test Content";
      mockEditorStore.tasksContent = "";
      mockEditorStore.activeTab = EDITOR_TABS.BLUEPRINT;
    });

    it("exports the project when content exists", async () => {
      render(
        <ExportProvider>
          <Editor />
        </ExportProvider>
      );

      fireEvent.keyDown(window, { key: "E", ctrlKey: true, shiftKey: true });

      await waitFor(() => expect(exportAsZip).toHaveBeenCalledTimes(1));
      expect(exportAsZip).toHaveBeenCalledWith(
        expect.objectContaining({
          blueprint: "# Test Content",
          projectName: "Test Project",
        })
      );
    });

    it("does not export when there is no content", () => {
      mockEditorStore.blueprintContent = "";
      mockEditorStore.tasksContent = "";
      render(
        <ExportProvider>
          <Editor />
        </ExportProvider>
      );

      fireEvent.keyDown(window, { key: "E", ctrlKey: true, shiftKey: true });

      expect(exportAsZip).not.toHaveBeenCalled();
    });

    it("does not export while typing in an input or textarea", () => {
      render(
        <ExportProvider>
          <Editor />
        </ExportProvider>
      );

      fireEvent.keyDown(screen.getByTestId("codemirror"), {
        key: "E",
        ctrlKey: true,
        shiftKey: true,
      });

      expect(exportAsZip).not.toHaveBeenCalled();
    });

    it("does not export with Ctrl/Cmd+E without Shift", () => {
      render(
        <ExportProvider>
          <Editor />
        </ExportProvider>
      );

      fireEvent.keyDown(window, { key: "e", ctrlKey: true, shiftKey: false });

      expect(exportAsZip).not.toHaveBeenCalled();
    });
  });

  describe("Ctrl/Cmd+S save-now shortcut", () => {
    beforeEach(() => {
      mockEditorStore.blueprintContent = "# Test Content";
      mockEditorStore.tasksContent = "";
      mockEditorStore.activeTab = EDITOR_TABS.BLUEPRINT;
    });

    it("flushes editor and wizard storage and shows a saved toast", () => {
      render(
        <ExportProvider>
          <Editor />
        </ExportProvider>
      );

      fireEvent.keyDown(window, { key: "s", ctrlKey: true });

      expect(mockEditorStore.flushStorage).toHaveBeenCalledTimes(1);
      expect(mockWizardStore.flushStorage).toHaveBeenCalledTimes(1);
      expect(mockToast.success).toHaveBeenCalledWith("Changes saved");
    });

    it("works with Cmd modifier", () => {
      render(
        <ExportProvider>
          <Editor />
        </ExportProvider>
      );

      fireEvent.keyDown(window, { key: "s", metaKey: true });

      expect(mockEditorStore.flushStorage).toHaveBeenCalledTimes(1);
      expect(mockToast.success).toHaveBeenCalled();
    });

    it("fires even while typing in the editor textarea", () => {
      render(
        <ExportProvider>
          <Editor />
        </ExportProvider>
      );

      fireEvent.keyDown(screen.getByTestId("codemirror"), { key: "s", ctrlKey: true });

      expect(mockEditorStore.flushStorage).toHaveBeenCalledTimes(1);
      expect(mockWizardStore.flushStorage).toHaveBeenCalledTimes(1);
    });

    it("does not flush on plain S without modifier", () => {
      render(
        <ExportProvider>
          <Editor />
        </ExportProvider>
      );

      fireEvent.keyDown(window, { key: "s", ctrlKey: false, metaKey: false });

      expect(mockEditorStore.flushStorage).not.toHaveBeenCalled();
      expect(mockToast.success).not.toHaveBeenCalled();
    });
  });

  describe("tab-switch scroll respects prefers-reduced-motion", () => {
    // jsdom does not reliably implement Element#scrollTo; provide a spy on the
    // prototype so the editor's tab-switch effect is observable. Restored in afterEach.
    const originalScrollTo = HTMLElement.prototype.scrollTo;
    let scrollToMock: Mock;

    function stubReducedMotion(matches: boolean): void {
      const mql = {
        matches,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList;
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mql));
    }

    beforeEach(() => {
      mockEditorStore.blueprintContent = "# Test Content";
      mockEditorStore.tasksContent = "";
      mockEditorStore.activeTab = EDITOR_TABS.BLUEPRINT;
      scrollToMock = vi.fn();
      Object.defineProperty(HTMLElement.prototype, "scrollTo", {
        configurable: true,
        writable: true,
        value: scrollToMock,
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      Object.defineProperty(HTMLElement.prototype, "scrollTo", {
        configurable: true,
        writable: true,
        value: originalScrollTo,
      });
    });

    it("smooth-scrolls the preview to top when motion reduction is not preferred", () => {
      stubReducedMotion(false);
      render(
        <ExportProvider>
          <Editor />
        </ExportProvider>
      );
      expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: SCROLL_BEHAVIOR.SMOOTH });
    });

    it("instantly scrolls the preview to top when reduced motion is preferred", () => {
      stubReducedMotion(true);
      render(
        <ExportProvider>
          <Editor />
        </ExportProvider>
      );
      expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: SCROLL_BEHAVIOR.AUTO });
    });
  });
});
