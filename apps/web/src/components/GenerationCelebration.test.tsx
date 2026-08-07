/**
 * Tests for GenerationCelebration
 *
 * Covers:
 * - Renders nothing when generation is not complete
 * - Renders celebration (status region) when complete
 * - Announces completion via ARIA role/aria-live
 * - Triggers onComplete after the completion delay
 * - Cleans up timers on unmount
 * - Cleans up timers when isComplete toggles off
 */

import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GenerationCelebration } from "./GenerationCelebration";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { CELEBRATION_TIMING } from "../config/constants";

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }: Record<string, unknown>) => (
    <div {...props}>{children as React.ReactNode}</div>
  )),
  svg: vi.fn(({ children, ...props }: Record<string, unknown>) => (
    <svg {...props}>{children as React.ReactNode}</svg>
  )),
  circle: vi.fn(({ children, ...props }: Record<string, unknown>) => (
    <circle {...props}>{children as React.ReactNode}</circle>
  )),
  path: vi.fn(({ children, ...props }: Record<string, unknown>) => (
    <path {...props}>{children as React.ReactNode}</path>
  )),
  p: vi.fn(({ children, ...props }: Record<string, unknown>) => (
    <p {...props}>{children as React.ReactNode}</p>
  )),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

describe("GenerationCelebration", () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReset();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when generation is not complete", () => {
    render(<GenerationCelebration isComplete={false} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders a status region announcing completion when complete", async () => {
    render(<GenerationCelebration isComplete={true} />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("calls onComplete after the completion delay", async () => {
    const onComplete = vi.fn();
    render(<GenerationCelebration isComplete={true} onComplete={onComplete} />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, CELEBRATION_TIMING.COMPLETION_DELAY + 50));
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not call onComplete when generation is not complete", () => {
    const onComplete = vi.fn();
    render(<GenerationCelebration isComplete={false} onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("cleans up timers on unmount", async () => {
    const onComplete = vi.fn();
    const { unmount } = render(<GenerationCelebration isComplete={true} onComplete={onComplete} />);

    unmount();

    await act(async () => {
      await new Promise((r) => setTimeout(r, CELEBRATION_TIMING.COMPLETION_DELAY + 100));
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("cleans up timers when completion toggles off", async () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <GenerationCelebration isComplete={true} onComplete={onComplete} />
    );

    rerender(<GenerationCelebration isComplete={false} onComplete={onComplete} />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, CELEBRATION_TIMING.COMPLETION_DELAY + 100));
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
