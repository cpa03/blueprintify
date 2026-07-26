import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { MotionConfigWrapper } from "./MotionConfigWrapper";

describe("MotionConfigWrapper", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders children", () => {
    render(
      <MotionConfigWrapper>
        <div data-testid="child">Test Child</div>
      </MotionConfigWrapper>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <MotionConfigWrapper>
        <span data-testid="first">First</span>
        <span data-testid="second">Second</span>
      </MotionConfigWrapper>
    );

    expect(screen.getByTestId("first")).toBeInTheDocument();
    expect(screen.getByTestId("second")).toBeInTheDocument();
  });

  it("calls onMount callback when mounted", () => {
    const onMount = vi.fn();

    render(
      <MotionConfigWrapper onMount={onMount}>
        <div>Content</div>
      </MotionConfigWrapper>
    );

    expect(onMount).toHaveBeenCalledTimes(1);
  });

  it("does not call onMount when not provided", () => {
    render(
      <MotionConfigWrapper>
        <div data-testid="content">Content</div>
      </MotionConfigWrapper>
    );

    // No error should occur — just renders children
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("content").textContent).toBe("Content");
  });

  it("does not re-call onMount on re-renders with same callback reference", () => {
    const onMount = vi.fn();

    const { rerender } = render(
      <MotionConfigWrapper onMount={onMount}>
        <div>Content</div>
      </MotionConfigWrapper>
    );

    expect(onMount).toHaveBeenCalledTimes(1);

    // Re-render with same onMount reference
    rerender(
      <MotionConfigWrapper onMount={onMount}>
        <div>Updated Content</div>
      </MotionConfigWrapper>
    );

    // useEffect depends on [onMount], so same reference should not re-trigger
    expect(onMount).toHaveBeenCalledTimes(1);
  });

  it("calls onMount again if callback reference changes", () => {
    const onMount1 = vi.fn();
    const onMount2 = vi.fn();

    const { rerender } = render(
      <MotionConfigWrapper onMount={onMount1}>
        <div>Content</div>
      </MotionConfigWrapper>
    );

    expect(onMount1).toHaveBeenCalledTimes(1);

    rerender(
      <MotionConfigWrapper onMount={onMount2}>
        <div>Content</div>
      </MotionConfigWrapper>
    );

    expect(onMount1).toHaveBeenCalledTimes(1);
    expect(onMount2).toHaveBeenCalledTimes(1);
  });
});
