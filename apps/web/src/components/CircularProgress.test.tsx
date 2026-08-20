/**
 * Tests for CircularProgress and CircularProgressCompact
 *
 * Covers:
 * - Renders SVG progress ring with correct ARIA role
 * - Displays percentage text when showPercentage is true
 * - Hides percentage text when showPercentage is false
 * - Clamps values to 0-100 range
 * - Applies complete glow class at 100%
 * - Applies animation glow class when isAnimating is true
 * - Celebration animation on first 100% completion
 * - Mount animation draws from 0 on first render
 * - Custom aria label overrides default
 * - Custom size and stroke width
 * - Handles edge case of value=0
 * - CircularProgressCompact renders at compact size
 */

import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CircularProgress, CircularProgressCompact } from "./CircularProgress";
import { UI_TIMEOUTS } from "@blueprint/shared/config";
import { useReducedMotion } from "../hooks/useReducedMotion";

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

describe("CircularProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders progressbar role with correct aria attributes", () => {
    render(<CircularProgress value={50} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders two SVG circles (track + progress)", () => {
    const { container } = render(<CircularProgress value={50} />);
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
  });

  it("displays percentage text when showPercentage is true", () => {
    render(<CircularProgress value={50} showPercentage={true} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("hides percentage text when showPercentage is false", () => {
    render(<CircularProgress value={50} showPercentage={false} />);
    expect(screen.queryByText("50%")).not.toBeInTheDocument();
  });

  it("clamps values above 100 to 100", () => {
    render(<CircularProgress value={150} showPercentage={true} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps values below 0 to 0", () => {
    render(<CircularProgress value={-10} showPercentage={true} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
  });

  it("applies circular-complete-glow class at 100%", () => {
    const { container } = render(<CircularProgress value={100} />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("circular-complete-glow");
  });

  it("does not apply complete glow class below 100%", () => {
    const { container } = render(<CircularProgress value={99} />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).not.toContain("circular-complete-glow");
  });

  it("applies generate-progress-glow class when isAnimating is true", () => {
    const { container } = render(<CircularProgress value={50} isAnimating={true} />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("generate-progress-glow");
  });

  it("applies circular-complete-celebration class temporarily on reaching 100%", () => {
    const { container } = render(<CircularProgress value={100} />);
    // Celebration fires immediately via useEffect
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("circular-complete-celebration");

    // After timeout, celebration class should be removed
    act(() => {
      vi.advanceTimersByTime(UI_TIMEOUTS.CELEBRATION_DISMISS_MS);
    });
    expect(outerDiv.className).not.toContain("circular-complete-celebration");
  });

  it("uses custom aria label when provided", () => {
    render(<CircularProgress value={50} ariaLabel="Custom label" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-label", "Custom label");
  });

  it("uses default aria label when not provided", () => {
    render(<CircularProgress value={50} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-label");
    expect(progressbar.getAttribute("aria-label")).toContain("50");
  });

  it("renders at custom size and stroke width", () => {
    const { container } = render(<CircularProgress value={50} size={80} strokeWidth={6} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "80");
    expect(svg).toHaveAttribute("height", "80");

    const circles = container.querySelectorAll("circle");
    circles.forEach((circle) => {
      expect(circle).toHaveAttribute("stroke-width", "6");
    });
  });

  it("starts at 0 for mount animation then transitions to value", () => {
    render(<CircularProgress value={80} animateOnMount={true} mountAnimationDelayMs={300} />);
    // Before timer fires, aria value should be 0 (mount starting point)
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");

    // After delay, it should update to 80
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(progressbar).toHaveAttribute("aria-valuenow", "80");
  });

  it("handles value=0 edge case without celebration", () => {
    const { container: outer } = render(<CircularProgress value={0} />);
    const outerDiv = outer.firstChild as HTMLElement;
    expect(outerDiv.className).not.toContain("circular-complete");
    expect(outerDiv.className).not.toContain("circular-complete-celebration");
  });

  it("renders percentage text as aria-hidden when shown", () => {
    render(<CircularProgress value={50} showPercentage={true} />);
    const percentageSpan = screen.getByText("50%");
    expect(percentageSpan).toHaveAttribute("aria-hidden", "true");
  });

  it("applies the animated stroke transition by default", () => {
    const { container } = render(<CircularProgress value={50} />);
    const progressCircle = container.querySelectorAll("circle")[1] as SVGElement;
    expect(progressCircle.style.transitionProperty).toContain("stroke-dashoffset");
  });

  it("omits the stroke transition when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<CircularProgress value={50} />);
    const progressCircle = container.querySelectorAll("circle")[1] as SVGElement;
    expect(progressCircle.style.transition).toBe("none");
    expect(progressCircle.style.transitionProperty).toBe("");
  });
});

describe("CircularProgressCompact", () => {
  it("renders a compact progress indicator", () => {
    render(<CircularProgressCompact value={50} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
  });

  it("does not show percentage text", () => {
    render(<CircularProgressCompact value={50} />);
    expect(screen.queryByText("50%")).not.toBeInTheDocument();
  });

  it("renders at compact default size of 16", () => {
    const { container: cmpContainer } = render(<CircularProgressCompact value={50} />);
    const svg = cmpContainer.querySelector("svg");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });
});
