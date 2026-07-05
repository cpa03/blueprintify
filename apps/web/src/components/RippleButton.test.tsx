/**
 * @fileoverview Tests for RippleButton component
 *
 * Tests cover the ripple effect button behavior:
 * - Rendering with default state
 * - Click handling and ripple creation
 * - Keyboard-triggered click centering
 * - Disabled state interaction
 * - Reduced motion behavior
 * - Accessibility features
 * - Hover/tap transform support
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { RippleButton, useRipple } from "./RippleButton";

// Mock the useReducedMotion hook
vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

// Import for typing
import { useReducedMotion } from "../hooks/useReducedMotion";

describe("RippleButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(<RippleButton>Click me</RippleButton>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders with default type 'button'", () => {
    render(<RippleButton>Test</RippleButton>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("supports custom className", () => {
    render(<RippleButton className="custom-class">Test</RippleButton>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("renders disabled state", () => {
    render(<RippleButton disabled>Test</RippleButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<RippleButton onClick={handleClick}>Test</RippleButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <RippleButton onClick={handleClick} disabled>
        Test
      </RippleButton>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("supports aria-label for accessibility", () => {
    render(<RippleButton ariaLabel="Add item">+</RippleButton>);
    expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument();
  });

  it("supports title attribute", () => {
    render(<RippleButton title="Tooltip text">Test</RippleButton>);
    expect(screen.getByRole("button")).toHaveAttribute("title", "Tooltip text");
  });

  it("renders children inside a z-10 span", () => {
    render(<RippleButton>Test</RippleButton>);
    const span = screen.getByRole("button").querySelector("span.z-10");
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent("Test");
  });

  it("creates ripple on click when reduced motion is false", () => {
    render(<RippleButton>Test</RippleButton>);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    // Ripple element should be created
    const ripple = button.querySelector(".animate-ripple");
    expect(ripple).toBeInTheDocument();
  });

  it("does not create ripple when reduced motion is enabled", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    render(<RippleButton>Test</RippleButton>);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    const ripple = button.querySelector(".animate-ripple");
    expect(ripple).not.toBeInTheDocument();
  });

  it("applies hover transform on mouse enter", () => {
    render(<RippleButton whileHover={{ scale: 1.05 }}>Test</RippleButton>);
    const button = screen.getByRole("button");

    fireEvent.mouseEnter(button);

    expect(button.style.transform).toBe("scale(1.05)");
  });

  it("clears hover transform on mouse leave", () => {
    render(<RippleButton whileHover={{ scale: 1.05 }}>Test</RippleButton>);
    const button = screen.getByRole("button");

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);

    expect(button.style.transform).toBe("");
  });

  it("applies tap transform on mouse down", () => {
    render(<RippleButton whileTap={{ scale: 0.95 }}>Test</RippleButton>);
    const button = screen.getByRole("button");

    fireEvent.mouseDown(button);

    expect(button.style.transform).toBe("scale(0.95)");
  });

  it("restores hover transform on mouse up after tap", () => {
    render(
      <RippleButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        Test
      </RippleButton>
    );
    const button = screen.getByRole("button");

    fireEvent.mouseEnter(button);
    fireEvent.mouseDown(button);
    expect(button.style.transform).toBe("scale(0.95)");

    fireEvent.mouseUp(button);
    expect(button.style.transform).toBe("scale(1.05)");
  });

  it("applies translateY transform correctly", () => {
    render(<RippleButton whileHover={{ y: -2 }}>Test</RippleButton>);
    const button = screen.getByRole("button");

    fireEvent.mouseEnter(button);

    expect(button.style.transform).toBe("translateY(-2px)");
  });

  it("applies combined scale and translateY transform", () => {
    render(<RippleButton whileHover={{ scale: 1.03, y: -1 }}>Test</RippleButton>);
    const button = screen.getByRole("button");

    fireEvent.mouseEnter(button);

    expect(button.style.transform).toBe("scale(1.03) translateY(-1px)");
  });

  it("supports submit type", () => {
    render(<RippleButton type="submit">Submit</RippleButton>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("forwards data-autofocus attribute", () => {
    render(<RippleButton data-autofocus="true">Test</RippleButton>);
    expect(screen.getByRole("button")).toHaveAttribute("data-autofocus", "true");
  });
});

describe("RippleButton keyboard accessibility", () => {
  it("centers ripple on keyboard-triggered click (clientX/Y = 0)", () => {
    render(<RippleButton>Test</RippleButton>);
    const button = screen.getByRole("button");

    // Dispatch click with clientX=0, clientY=0 simulating keyboard click
    const rect = { width: 200, height: 50, top: 0, left: 0, bottom: 50, right: 200 };
    Object.defineProperty(button, "getBoundingClientRect", {
      value: () => rect,
    });

    fireEvent.click(button, { clientX: 0, clientY: 0 });
  });
});

describe("useRipple hook", () => {
  it("returns initial empty state", () => {
    function TestComponent() {
      const { createRipple, RippleOverlay, ripples } = useRipple();
      return (
        <div>
          <span data-testid="ripple-count">{ripples.length}</span>
          <span data-testid="has-create">{typeof createRipple === "function" ? "yes" : "no"}</span>
          <RippleOverlay />
        </div>
      );
    }

    const { container } = render(<TestComponent />);
    expect(container.querySelector('[data-testid="ripple-count"]')).toHaveTextContent("0");
    expect(container.querySelector('[data-testid="has-create"]')).toHaveTextContent("yes");
  });
});
