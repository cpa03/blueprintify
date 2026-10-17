/**
 * @fileoverview Tests for StepTransition component
 *
 * Tests cover the lazy-loaded AnimatePresence wrapper:
 * - Renders children correctly
 * - Uses default mode "wait"
 * - Renders children in Suspense fallback while framer-motion loads
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StepTransition } from "./StepTransition";
import { useReducedMotion } from "../hooks/useReducedMotion";

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

describe("StepTransition", () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("renders children", () => {
    render(
      <StepTransition>
        <div data-testid="child">Test Child</div>
      </StepTransition>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <StepTransition>
        <span data-testid="child-1">First</span>
        <span data-testid="child-2">Second</span>
      </StepTransition>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("accepts custom mode prop and reflects it in data-mode attribute", () => {
    const { container } = render(
      <StepTransition mode="popLayout">
        <div data-testid="child">Test</div>
      </StepTransition>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-mode", "popLayout");
  });

  it("sets data-reduced-motion attribute based on motion preference", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(
      <StepTransition>
        <div data-testid="child">Test</div>
      </StepTransition>
    );

    expect(container.firstElementChild).toHaveAttribute("data-reduced-motion", "true");
    expect(container.firstElementChild).toHaveAttribute("data-mode", "wait");
  });

  it("renders empty children gracefully inside wrapper", () => {
    const { container } = render(<StepTransition>{null}</StepTransition>);

    expect(container.firstElementChild).toHaveAttribute("data-reduced-motion", "false");
    expect(container.firstElementChild).toHaveAttribute("data-mode", "wait");
  });
});
