import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { EditorEmptyState } from "./EditorEmptyState";
import { useWizardStore } from "../store";
import type { WizardStore } from "../store/wizard";
import { WIZARD_STEPS } from "../config/constants";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";

vi.mock("../store", () => ({
  useWizardStore: vi.fn(),
}));

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

import { useReducedMotion } from "../hooks/useReducedMotion";

const capturedAnimateProps = vi.hoisted(() => [] as unknown[]);

// Framer motion subpath mock (framer-motion/m exports motion components)
vi.mock("framer-motion/m", () => ({
  div: vi.fn(
    ({
      children,
      animate,
      ...props
    }: {
      children?: ReactNode;
      animate?: unknown;
      [key: string]: unknown;
    }) => {
      capturedAnimateProps.push(animate);
      return <div {...props}>{children}</div>;
    }
  ),
  span: vi.fn(
    ({
      children,
      animate,
      ...props
    }: {
      children?: ReactNode;
      animate?: unknown;
      [key: string]: unknown;
    }) => {
      capturedAnimateProps.push(animate);
      return <span {...props}>{children}</span>;
    }
  ),
  p: vi.fn(
    ({
      children,
      animate,
      ...props
    }: {
      children?: ReactNode;
      animate?: unknown;
      [key: string]: unknown;
    }) => {
      capturedAnimateProps.push(animate);
      return <p {...props}>{children}</p>;
    }
  ),
  h3: vi.fn(
    ({
      children,
      animate,
      ...props
    }: {
      children?: ReactNode;
      animate?: unknown;
      [key: string]: unknown;
    }) => {
      capturedAnimateProps.push(animate);
      return <h3 {...props}>{children}</h3>;
    }
  ),
}));

const mockWizardStore: WizardStore = {
  currentStep: WIZARD_STEP_KEYS.INFO,
  projectName: "",
  description: "",
  targetAudience: "",
  constraints: "",
  techStack: [],
  features: [],
  setProjectName: vi.fn(),
  setDescription: vi.fn(),
  setTargetAudience: vi.fn(),
  setConstraints: vi.fn(),
  addTechStack: vi.fn(),
  removeTechStack: vi.fn(),
  setTechStack: vi.fn(),
  addFeature: vi.fn(),
  removeFeature: vi.fn(),
  clearFeatures: vi.fn(),
  clearForm: vi.fn(),
  setStep: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  reset: vi.fn(),
  loadTemplate: vi.fn(),
  flushStorage: vi.fn(),
};

describe("EditorEmptyState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedAnimateProps.length = 0;
    (useWizardStore as unknown as Mock).mockImplementation(
      (selector: (state: WizardStore) => unknown) => selector(mockWizardStore)
    );
  });

  it("renders the title", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText("Your blueprint is waiting to be created")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<EditorEmptyState />);
    expect(
      screen.getByText("Complete the wizard steps to generate your project documentation")
    ).toBeInTheDocument();
  });

  it("shows progress as 1 of N when on first step", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText(/1 of/)).toBeInTheDocument();
  });

  it("shows keyboard shortcut hint", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
  });

  it("shows submit wizard hint with shortcut key", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText("Submit wizard")).toBeInTheDocument();
  });

  it("shows next step hint", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText("Next step")).toBeInTheDocument();
  });

  it("shows currently-on step label", () => {
    render(<EditorEmptyState />);
    expect(screen.getByText(WIZARD_STEPS[0].label)).toBeInTheDocument();
  });

  it("shows progress percentage", () => {
    render(<EditorEmptyState />);
    const percentText = screen.getByText(/%/);
    expect(percentText).toBeInTheDocument();
  });

  it("renders without crashing when currentStep is the last step", () => {
    (useWizardStore as unknown as Mock).mockImplementation(
      (selector: (state: WizardStore) => unknown) =>
        selector({ ...mockWizardStore, currentStep: WIZARD_STEP_KEYS.GENERATING })
    );
    render(<EditorEmptyState />);
    expect(screen.getByText("Your blueprint is waiting to be created")).toBeInTheDocument();
  });

  it("passes no keyframe animations when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<EditorEmptyState />);

    const keyframeAnims = capturedAnimateProps.filter(
      (animate) =>
        typeof animate === "object" &&
        animate !== null &&
        Object.values(animate as Record<string, unknown>).some((value) => Array.isArray(value))
    );
    expect(keyframeAnims).toHaveLength(0);

    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("passes keyframe animations when motion is allowed", () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<EditorEmptyState />);

    const keyframeAnims = capturedAnimateProps.filter(
      (animate) =>
        typeof animate === "object" &&
        animate !== null &&
        Object.values(animate as Record<string, unknown>).some((value) => Array.isArray(value))
    );
    expect(keyframeAnims.length).toBeGreaterThan(0);

    vi.mocked(useReducedMotion).mockReturnValue(false);
  });
});
