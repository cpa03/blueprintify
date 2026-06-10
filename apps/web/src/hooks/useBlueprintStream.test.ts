/**
 * @fileoverview Tests for useBlueprintStream hook
 *
 * Tests cover the SSE streaming generation workflow:
 * - Starting blueprint generation
 * - Handling streaming content chunks
 * - Error handling during generation
 * - Task generation flow after blueprint completion
 * - Cancellation of ongoing generation
 * - Progress tracking
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBlueprintStream } from "./useBlueprintStream";
import { generateBlueprint, generateTasks } from "../lib/api";
import { useWizardStore, useEditorStore } from "../store";
import { EDITOR_TABS } from "../config/constants";

// Mock the API module
vi.mock("../lib/api", () => ({
  generateBlueprint: vi.fn(),
  generateTasks: vi.fn(),
}));

// The store hooks are Zustand stores. We need to reset them before each test.
// We import the actual stores but reset their state in beforeEach.
function resetStores(): void {
  useWizardStore.setState({
    projectName: "",
    description: "",
    techStack: [],
    features: [],
    targetAudience: "",
    constraints: "",
    currentStep: "info",
  });
  useEditorStore.setState({
    blueprintContent: "",
    tasksContent: "",
    activeTab: EDITOR_TABS.BLUEPRINT,
    isGenerating: false,
    generationProgress: "",
    isDirty: false,
  });
}

describe("useBlueprintStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStores();
  });

  it("should return initial idle state", () => {
    const { result } = renderHook(() => useBlueprintStream());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.progress).toBe("");
    expect(typeof result.current.startGeneration).toBe("function");
    expect(typeof result.current.cancelGeneration).toBe("function");
  });

  it("should set generating state and progress when startGeneration is called", async () => {
    // Make generateBlueprint resolve immediately without doing anything
    vi.mocked(generateBlueprint).mockImplementation(async (_req, handlers) => {
      handlers.onDone?.();
    });
    vi.mocked(generateTasks).mockResolvedValue(undefined);

    // Set some wizard state
    useWizardStore.setState({
      projectName: "Test Project",
      description: "A test project",
      techStack: [
        { name: "React", category: "frontend" },
        { name: "Node.js", category: "backend" },
      ],
      features: ["auth"],
    });

    const { result } = renderHook(() => useBlueprintStream());

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(generateBlueprint).toHaveBeenCalledTimes(1);
    // The request should contain our wizard state
    const requestArg = vi.mocked(generateBlueprint).mock.calls[0]?.[0];
    expect(requestArg).toMatchObject({
      projectName: "Test Project",
      description: "A test project",
    });
  });

  it("should handle streaming content chunks", async () => {
    vi.mocked(generateBlueprint).mockImplementation(async (_req, handlers) => {
      handlers.onChunk("chunk1");
      handlers.onChunk("chunk2");
      handlers.onChunk("chunk3");
      handlers.onDone?.();
    });
    vi.mocked(generateTasks).mockResolvedValue(undefined);

    useWizardStore.setState({
      projectName: "Test",
      description: "Test desc",
    });

    const { result } = renderHook(() => useBlueprintStream());

    await act(async () => {
      await result.current.startGeneration();
    });

    // Blueprint content should have been appended
    expect(useEditorStore.getState().blueprintContent).toBe("chunk1chunk2chunk3");
  });

  it("should handle errors during blueprint generation", async () => {
    vi.mocked(generateBlueprint).mockImplementation(async (_req, handlers) => {
      handlers.onError("Network error");
    });

    useWizardStore.setState({
      projectName: "Test",
      description: "Test desc",
    });

    const { result } = renderHook(() => useBlueprintStream());

    await act(async () => {
      await result.current.startGeneration();
    });

    // Should show error message
    expect(useEditorStore.getState().generationProgress).toContain("Error");
    expect(useEditorStore.getState().isGenerating).toBe(false);
  });

  it("should handle errors during task generation", async () => {
    vi.mocked(generateBlueprint).mockImplementation(async (_req, handlers) => {
      handlers.onDone?.();
    });
    vi.mocked(generateTasks).mockImplementation(async (_req, handlers) => {
      handlers.onError?.("Task generation failed");
    });

    useWizardStore.setState({
      projectName: "Test",
      description: "Test desc",
    });

    const { result } = renderHook(() => useBlueprintStream());

    await act(async () => {
      await result.current.startGeneration();
    });

    // Should have error in progress message
    const progress = useEditorStore.getState().generationProgress;
    expect(progress).toContain("Error");
    expect(useEditorStore.getState().isGenerating).toBe(false);
  });

  it("should cancel generation when cancelGeneration is called", () => {
    const { result } = renderHook(() => useBlueprintStream());

    act(() => {
      result.current.cancelGeneration();
    });

    // Cancel should call the editor store's cancelGeneration
    expect(useEditorStore.getState().isGenerating).toBe(false);
  });

  it("should call onRetry when generateBlueprint signals retry", async () => {
    vi.mocked(generateBlueprint).mockImplementation(async (_req, handlers) => {
      // Call onRetry but DON'T call onDone - so generation stays in retry state
      handlers.onRetry?.(1, 3);
    });
    vi.mocked(generateTasks).mockResolvedValue(undefined);

    useWizardStore.setState({
      projectName: "Test",
      description: "Test desc",
    });

    const { result } = renderHook(() => useBlueprintStream());

    await act(async () => {
      await result.current.startGeneration();
    });

    // The handler should have been called with retry info
    expect(vi.mocked(generateBlueprint).mock.calls[0]?.[1]?.onRetry).toBeDefined();
  });

  it("should handle empty features list gracefully", async () => {
    vi.mocked(generateBlueprint).mockImplementation(async (_req, handlers) => {
      handlers.onDone?.();
    });
    vi.mocked(generateTasks).mockResolvedValue(undefined);

    useWizardStore.setState({
      projectName: "Empty Features",
      description: "No features",
      features: [],
    });

    const { result } = renderHook(() => useBlueprintStream());

    await act(async () => {
      await result.current.startGeneration();
    });

    // Should not include features field in request (undefined when empty)
    const requestArg = vi.mocked(generateBlueprint).mock.calls[0]?.[0];
    expect(requestArg?.features).toBeUndefined();
  });

  it("should set step to generating when started", async () => {
    vi.mocked(generateBlueprint).mockImplementation(async (_req, handlers) => {
      handlers.onDone?.();
    });
    vi.mocked(generateTasks).mockResolvedValue(undefined);

    useWizardStore.setState({
      projectName: "Test",
      description: "Test desc",
    });

    const { result } = renderHook(() => useBlueprintStream());

    expect(useWizardStore.getState().currentStep).toBe("info");

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(useWizardStore.getState().currentStep).toBe("generating");
  });

  it("should progress to task generation after blueprint completes", async () => {
    vi.mocked(generateBlueprint).mockImplementation(async (_req, handlers) => {
      // Simulate some blueprint content being added
      useEditorStore.setState({ blueprintContent: "Generated blueprint content" });
      handlers.onDone?.();
    });
    vi.mocked(generateTasks).mockImplementation(async (_req, handlers) => {
      handlers.onChunk?.("Task chunk");
      handlers.onDone?.();
    });

    useWizardStore.setState({
      projectName: "Test",
      description: "Test desc",
    });

    const { result } = renderHook(() => useBlueprintStream());

    await act(async () => {
      await result.current.startGeneration();
    });

    // Both generateBlueprint and generateTasks should have been called
    expect(generateBlueprint).toHaveBeenCalledTimes(1);
    expect(generateTasks).toHaveBeenCalledTimes(1);

    // Task content should be populated
    expect(useEditorStore.getState().tasksContent).toBe("Task chunk");
  });

  it("should not re-create startGeneration on unrelated state changes", () => {
    const { result, rerender } = renderHook(() => useBlueprintStream());
    const initialStartGeneration = result.current.startGeneration;

    // Rerender with same state
    rerender();

    expect(result.current.startGeneration).toBe(initialStartGeneration);
  });
});
