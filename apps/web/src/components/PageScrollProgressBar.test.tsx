/**
 * Tests for PageScrollProgressBar
 *
 * Covers:
 * - Renders the interactive page-level progress bar
 * - Animates the fill with an infinite opacity pulse by default
 * - Disables the infinite opacity pulse when reduced motion is preferred
 * - Keeps the fill rendered under reduced motion
 */

import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PageScrollProgressBar } from "./PageScrollProgressBar";
import { useReducedMotion } from "../hooks/useReducedMotion";

// Capture props passed to motion.div so tests can assert on the animation config
let capturedDivProps: Array<Record<string, unknown>> = [];

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }: Record<string, unknown>) => {
    capturedDivProps.push(props);
    return <div {...props}>{children as React.ReactNode}</div>;
  }),
}));

vi.mock("framer-motion", () => ({
  useSpring: vi.fn(() => ({ set: vi.fn() })),
  useTransform: vi.fn(() => "0%"),
}));

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

function renderPageProgressBar(): void {
  render(<PageScrollProgressBar />);
}

/** The fill is the gradient motion.div that drives the opacity pulse */
function getFillProps(): Record<string, unknown> | undefined {
  return capturedDivProps.find((p) => {
    const className = p.className;
    return typeof className === "string" && className.includes("relative h-full bg-gradient-to-r");
  });
}

describe("PageScrollProgressBar", () => {
  beforeEach(() => {
    capturedDivProps = [];
    vi.mocked(useReducedMotion).mockReset();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("renders the gradient fill", () => {
    renderPageProgressBar();

    expect(getFillProps()).toBeDefined();
  });

  it("animates the fill with an infinite opacity pulse by default", () => {
    renderPageProgressBar();

    const fill = getFillProps();
    const transition = fill?.transition as {
      opacity?: { repeat?: number };
    };
    expect(transition.opacity?.repeat).toBe(Infinity);
  });

  it("disables the infinite opacity pulse when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    renderPageProgressBar();

    const fill = getFillProps();
    const animate = fill?.animate as { opacity: number };
    // Fill settles on a steady opacity value instead of a pulsing keyframe range
    expect(animate.opacity).toBeTypeOf("number");
    const transition = fill?.transition as {
      opacity?: { repeat?: number };
    };
    expect(transition.opacity?.repeat).toBeUndefined();
  });

  it("keeps the fill rendered when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    renderPageProgressBar();

    expect(getFillProps()).toBeDefined();
  });
});
