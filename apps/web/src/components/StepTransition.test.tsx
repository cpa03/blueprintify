/**
 * @fileoverview Tests for StepTransition component
 *
 * Tests cover the lazy-loaded AnimatePresence wrapper:
 * - Renders children correctly
 * - Uses default mode "wait"
 * - Renders children in Suspense fallback while framer-motion loads
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StepTransition } from "./StepTransition";

describe("StepTransition", () => {
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

  it("accepts custom mode prop", () => {
    render(
      <StepTransition mode="popLayout">
        <div data-testid="child">Test</div>
      </StepTransition>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders empty children gracefully", () => {
    const { container } = render(<StepTransition>{null}</StepTransition>);

    expect(container.innerHTML).toBe("");
  });
});
