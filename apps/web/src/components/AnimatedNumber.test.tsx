/**
 * @fileoverview Tests for AnimatedNumber and AnimatedCounter components
 *
 * Tests cover the animated number display:
 * - Renders initial value
 * - Uses custom format function
 * - Applies custom className
 * - AnimatedCounter renders with icon and label
 * - Respects reduced motion
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnimatedNumber, AnimatedCounter } from "./AnimatedNumber";
import { COUNTER_DIRECTION_VALUES } from "@blueprint/shared";

// Mock the ReducedMotionContext
vi.mock("../context/ReducedMotionContext", () => ({
  useReducedMotionContext: vi.fn(() => ({
    shouldAnimate: false,
    getDuration: vi.fn((d: number) => d),
  })),
}));

describe("AnimatedNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial value and inspection attributes", () => {
    render(<AnimatedNumber value={42} />);

    const span = screen.getByText("42");
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute("data-direction", COUNTER_DIRECTION_VALUES.IDLE);
    expect(span).toHaveAttribute("data-value", "42");
  });

  it("renders zero value", () => {
    render(<AnimatedNumber value={0} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("uses custom format function", () => {
    render(<AnimatedNumber value={1234} format={(v) => `${Math.round(v).toLocaleString()}`} />);

    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("formats decimal values with Math.round by default", () => {
    render(<AnimatedNumber value={99.7} />);

    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<AnimatedNumber value={10} className="text-lg font-bold" />);

    const span = screen.getByText("10");
    expect(span.className).toContain("tabular-nums");
    expect(span.className).toContain("text-lg");
    expect(span.className).toContain("font-bold");
  });

  it("is decorative for assistive tech rather than a chatty live region", () => {
    render(<AnimatedNumber value={42} />);

    // The count-up animation rewrites this span's text every animation frame;
    // exposing it as aria-live would spam screen readers with intermediate
    // values. The authoritative value is announced via the dedicated
    // role="status" announcer in StepGenerating.
    const span = screen.getByText("42");
    expect(span).toHaveAttribute("aria-hidden", "true");
    expect(span).not.toHaveAttribute("aria-live");
    expect(span).not.toHaveAttribute("aria-atomic");
  });
});

describe("AnimatedCounter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders value and label with inspection attributes", () => {
    render(<AnimatedCounter value={42} label="Projects" />);

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    const counterCard = screen.getByText("Projects").closest("[data-state]");
    expect(counterCard).toHaveAttribute("data-state", "idle");
    expect(counterCard).toHaveAttribute("data-value", "42");
  });

  it("renders with icon", () => {
    render(<AnimatedCounter value={10} label="Stars" icon={<span data-testid="icon">★</span>} />);

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Stars")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<AnimatedCounter value={100} />);

    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("applies custom classNames", () => {
    render(
      <AnimatedCounter
        value={50}
        label="Tasks"
        className="p-8"
        valueClassName="text-3xl"
        labelClassName="uppercase"
      />
    );

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });
});
