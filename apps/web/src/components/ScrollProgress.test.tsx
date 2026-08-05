/**
 * Tests for ScrollProgress and ScrollProgressCompact
 *
 * Covers:
 * - Renders the reading progress bar fill
 * - Animates the fill with an infinite glow pulse by default
 * - Disables the infinite glow pulse when reduced motion is preferred
 * - Keeps the fill rendered under reduced motion
 */

import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRef } from "react";
import { ScrollProgress } from "./ScrollProgress";
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

function renderScrollProgress(): void {
  const ref = createRef<HTMLDivElement>();
  render(
    <div>
      <div ref={ref} style={{ height: "100px", overflow: "auto" }}>
        content
      </div>
      <ScrollProgress scrollContainerRef={ref as React.RefObject<HTMLElement | null>} />
    </div>
  );
}

/** The fill is the gradient motion.div that drives the glow pulse */
function getFillProps(): Record<string, unknown> | undefined {
  return capturedDivProps.find((p) => {
    const className = p.className;
    return typeof className === "string" && className.includes("h-full bg-gradient-to-r");
  });
}

describe("ScrollProgress", () => {
  beforeEach(() => {
    capturedDivProps = [];
    vi.mocked(useReducedMotion).mockReset();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("renders the gradient fill", () => {
    renderScrollProgress();

    expect(getFillProps()).toBeDefined();
  });

  it("animates the fill with an infinite glow pulse by default", () => {
    renderScrollProgress();

    const fill = getFillProps();
    const transition = fill?.transition as {
      opacity?: { repeat?: number };
      boxShadow?: { repeat?: number };
    };
    expect(transition.opacity?.repeat).toBe(Infinity);
    expect(transition.boxShadow?.repeat).toBe(Infinity);
  });

  it("disables the infinite glow pulse when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    renderScrollProgress();

    const fill = getFillProps();
    const animate = fill?.animate as { opacity: number; boxShadow: string };
    // Fill settles on a steady opacity value instead of a pulsing keyframe range
    expect(animate.opacity).toBeTypeOf("number");
    expect(animate.boxShadow).toBeTypeOf("string");
    const transition = fill?.transition as {
      opacity?: { repeat?: number };
      boxShadow?: { repeat?: number };
    };
    expect(transition.opacity?.repeat).toBeUndefined();
    expect(transition.boxShadow?.repeat).toBeUndefined();
  });

  it("keeps the fill rendered when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    renderScrollProgress();

    expect(getFillProps()).toBeDefined();
  });
});
