/**
 * @fileoverview Tests for StepTransition component
 *
 * Tests cover the lazy-loaded AnimatePresence wrapper:
 * - Renders children correctly
 * - Uses default mode "wait"
 * - Renders children in Suspense fallback while framer-motion loads
 */
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StepTransition } from "./StepTransition";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  DATA_BOOLEAN_VALUES,
  ANIMATE_PRESENCE_MODES,
  PROGRESS_STATE_VALUES,
} from "@blueprint/shared/config";

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

describe("StepTransition", () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("renders children", async () => {
    await act(async () => {
      render(
        <StepTransition>
          <div data-testid="child">Test Child</div>
        </StepTransition>
      );
    });

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders multiple children", async () => {
    await act(async () => {
      render(
        <StepTransition mode={ANIMATE_PRESENCE_MODES.SYNC}>
          <span key="child-1" data-testid="child-1">First</span>
          <span key="child-2" data-testid="child-2">Second</span>
        </StepTransition>
      );
    });

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("accepts custom mode prop and reflects it in data-mode attribute", async () => {
    let container: HTMLElement;
    await act(async () => {
      const res = render(
        <StepTransition mode={ANIMATE_PRESENCE_MODES.POP_LAYOUT}>
          <div data-testid="child">Test</div>
        </StepTransition>
      );
      container = res.container;
    });

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(container!.firstElementChild).toHaveAttribute("data-mode", ANIMATE_PRESENCE_MODES.POP_LAYOUT);
  });

  it("sets data-reduced-motion and data-state attributes based on motion preference", async () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    let container: HTMLElement;
    await act(async () => {
      const res = render(
        <StepTransition>
          <div data-testid="child">Test</div>
        </StepTransition>
      );
      container = res.container;
    });

    expect(container!.firstElementChild).toHaveAttribute(
      "data-reduced-motion",
      DATA_BOOLEAN_VALUES.TRUE
    );
    expect(container!.firstElementChild).toHaveAttribute(
      "data-state",
      PROGRESS_STATE_VALUES.IDLE
    );
    expect(container!.firstElementChild).toHaveAttribute(
      "data-mode",
      ANIMATE_PRESENCE_MODES.WAIT
    );
  });

  it("sets data-state to animating when motion is not reduced", async () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    let container: HTMLElement;
    await act(async () => {
      const res = render(
        <StepTransition>
          <div data-testid="child">Test</div>
        </StepTransition>
      );
      container = res.container;
    });

    expect(container!.firstElementChild).toHaveAttribute(
      "data-state",
      PROGRESS_STATE_VALUES.ANIMATING
    );
  });

  it("renders empty children gracefully inside wrapper", async () => {
    let container: HTMLElement;
    await act(async () => {
      const res = render(<StepTransition>{null}</StepTransition>);
      container = res.container;
    });

    expect(container!.firstElementChild).toHaveAttribute(
      "data-reduced-motion",
      DATA_BOOLEAN_VALUES.FALSE
    );
    expect(container!.firstElementChild).toHaveAttribute(
      "data-mode",
      ANIMATE_PRESENCE_MODES.WAIT
    );
  });
});
