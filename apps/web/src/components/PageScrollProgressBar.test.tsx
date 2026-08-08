/**
 * Tests for PageScrollProgressBar
 *
 * Covers:
 * - Renders the interactive page-level progress bar
 * - Animates the fill with an infinite opacity pulse by default
 * - Disables the infinite opacity pulse when reduced motion is preferred
 * - Keeps the fill rendered under reduced motion
 * - Exposes interactive slider semantics (role, orientation, values)
 * - Provides a visible focus indicator (WCAG 2.4.7)
 * - Reveals the thumb on keyboard focus for parity with hover
 */

import { render, screen, fireEvent } from "@testing-library/react";
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

/** The outer bar is the motion.div that carries the slider role and focus handlers */
function getBarProps(): Record<string, unknown> | undefined {
  return capturedDivProps.find((p) => p.role === "slider");
}

/** The thumb is the small dot that signals interactivity on hover/focus */
function getThumbProps(): Record<string, unknown> | undefined {
  // Return the latest render's props (each re-render appends a new capture)
  return [...capturedDivProps].reverse().find((p) => {
    const className = p.className;
    return typeof className === "string" && className.includes("rounded-full bg-white shadow-lg");
  });
}

/** Simulate a scrolled page so the bar becomes visible and focusable */
function mockScrolledPage(): void {
  Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: 2000,
    configurable: true,
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

  it("exposes interactive slider semantics instead of read-only progressbar", () => {
    renderPageProgressBar();

    const bar = getBarProps();
    expect(bar).toBeDefined();
    expect(bar?.role).toBe("slider");
    expect(bar?.["aria-orientation"]).toBe("horizontal");
    expect(bar?.["aria-valuemin"]).toBe(0);
    expect(bar?.["aria-valuemax"]).toBe(100);
    // A slider requires a numeric value at all times, not undefined when hidden
    expect(bar?.["aria-valuenow"]).toBeTypeOf("number");
  });

  it("provides a human-readable value text for screen readers", () => {
    renderPageProgressBar();

    const bar = getBarProps();
    expect(bar?.["aria-valuetext"]).toBe("0% of page");
  });

  it("adds a visible focus indicator class for keyboard users", () => {
    renderPageProgressBar();

    const bar = getBarProps();
    const className = bar?.className;
    expect(typeof className).toBe("string");
    expect(className as string).toContain("focus-visible:outline-none");
    expect(className as string).toContain("focus-visible:ring-2");
  });

  it("reveals the thumb when the bar receives keyboard focus", () => {
    mockScrolledPage();
    renderPageProgressBar();

    const slider = screen.getByRole("slider");
    fireEvent.focus(slider);

    const thumb = getThumbProps();
    const animate = thumb?.animate as { scale: number; opacity: number };
    expect(animate.scale).toBe(1);
    expect(animate.opacity).toBe(1);
  });

  it("hides the thumb when focus leaves the bar", () => {
    mockScrolledPage();
    renderPageProgressBar();

    const slider = screen.getByRole("slider");
    fireEvent.focus(slider);
    fireEvent.blur(slider);

    const thumb = getThumbProps();
    const animate = thumb?.animate as { scale: number; opacity: number };
    expect(animate.scale).toBe(0);
    expect(animate.opacity).toBe(0);
  });
});
