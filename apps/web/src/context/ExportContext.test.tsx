/**
 * @fileoverview Tests for ExportContext provider and useExportContext hook.
 *
 * Verifies:
 * - getExportMetadata aggregates project metadata from the wizard store
 * - DEFAULT_PROJECT_NAME fallback when projectName is empty
 * - useExportContext throws when used outside the provider
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { ExportProvider, useExportContext } from "./ExportContext";
import { useWizardStore } from "../store";
import { DEFAULT_PROJECT_NAME } from "../config/constants";
import type { TechStackItemType } from "@blueprint/shared/types";

// Mock the storage module so the wizard/editor stores never touch real storage
vi.mock("../lib/storage", () => ({
  wizardStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
  editorStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock the persistence module to keep the wizard store isolated
vi.mock("../store/persistence", () => ({
  createPersistedStore: vi.fn(() => ({
    loadState: vi.fn(),
    debouncedSave: vi.fn(),
    cancelSave: vi.fn(),
    flushSave: vi.fn(),
  })),
}));

const TECH_STACK: TechStackItemType[] = [
  { name: "React", category: "frontend", version: "19.0.0" },
  { name: "Hono", category: "backend", version: "4.0.0" },
];

function renderWithProvider() {
  return renderHook(() => useExportContext(), {
    wrapper: ({ children }) => <ExportProvider>{children}</ExportProvider>,
  });
}

describe("ExportContext", () => {
  beforeEach(() => {
    useWizardStore.getState().reset();
  });

  it("should return the default project name when the wizard store is empty", () => {
    const { result } = renderWithProvider();

    expect(result.current.getExportMetadata()).toEqual({
      projectName: DEFAULT_PROJECT_NAME,
      description: "",
      techStack: [],
      features: [],
    });
  });

  it("should aggregate project metadata from the wizard store", () => {
    useWizardStore.setState({
      projectName: "Blueprintify",
      description: "AI-powered architecture docs",
      techStack: TECH_STACK,
      features: ["wizard", "editor"],
    });

    const { result } = renderWithProvider();

    expect(result.current.getExportMetadata()).toEqual({
      projectName: "Blueprintify",
      description: "AI-powered architecture docs",
      techStack: TECH_STACK,
      features: ["wizard", "editor"],
    });
  });

  it("should use the wizard store project name even when only description is set", () => {
    useWizardStore.setState({
      projectName: "My App",
      description: "A description",
    });

    const { result } = renderWithProvider();

    expect(result.current.getExportMetadata().projectName).toBe("My App");
    expect(result.current.getExportMetadata().description).toBe("A description");
  });

  it("should throw when useExportContext is used outside the provider", () => {
    expect(() => renderHook(() => useExportContext())).toThrow(
      "useExportContext must be used within an ExportProvider"
    );
  });
});
