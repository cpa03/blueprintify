/**
 * @fileoverview Tests for AnimatedCopyButton component
 *
 * Tests cover the animated copy button behavior:
 * - Rendering with default state
 * - Click handling and particle celebration
 * - Disabled state interaction
 * - Accessibility features (ARIA labels, live region)
 * - Copied state styling
 * - Reduced motion behavior (particles and hover transforms disabled)
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { COPY_STATE_VALUES } from "@blueprint/shared";
import { COPY_BUTTON_LABELS, PARTICLE_CONFIG, HOVER_SCALE, CSS_CLASSES } from "../config/constants";
import { AnimatedCopyButton } from "./AnimatedCopyButton";
import { useReducedMotion } from "../hooks/useReducedMotion";
import * as motion from "framer-motion/m";

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock("framer-motion/m", () => ({
  button: vi.fn(({ children, whileHover: _w1, whileTap: _w2, animate: _a, ...props }) => (
    <button {...props}>{children}</button>
  )),
  span: vi.fn(({ children, whileHover: _w1, whileTap: _w2, ...props }) => (
    <span {...props}>{children}</span>
  )),
  div: vi.fn(
    ({
      children,
      whileHover: _w1,
      whileTap: _w2,
      animate: _a,
      initial: _i,
      exit: _e,
      ...props
    }) => <div {...props}>{children}</div>
  ),
  svg: vi.fn(
    ({ children, whileHover: _w1, initial: _i, animate: _a, transition: _t, ...props }) => (
      <svg {...props}>{children}</svg>
    )
  ),
  path: vi.fn(({ children, initial: _i, animate: _a, transition: _t, ...props }) => (
    <path {...props}>{children}</path>
  )),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

describe("AnimatedCopyButton", () => {
  const defaultProps = {
    onCopy: vi.fn(),
    isCopied: false,
    hasContent: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("renders copy button with 'Copy' label", () => {
    render(<AnimatedCopyButton {...defaultProps} />);

    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("renders 'Copied!' label when isCopied is true", () => {
    render(<AnimatedCopyButton {...defaultProps} isCopied={true} />);

    expect(screen.getByText("Copied!")).toBeInTheDocument();
    expect(screen.queryByText("Copy")).not.toBeInTheDocument();
  });

  it("calls onCopy when clicked", () => {
    render(<AnimatedCopyButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button"));

    expect(defaultProps.onCopy).toHaveBeenCalledTimes(1);
  });

  it("is disabled when hasContent is false", () => {
    render(<AnimatedCopyButton {...defaultProps} hasContent={false} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies the disabled visual state when hasContent is false", () => {
    render(<AnimatedCopyButton {...defaultProps} hasContent={false} />);

    const button = screen.getByRole("button");
    expect(button.className).toContain(CSS_CLASSES.DISABLED_BUTTON_STATE);
  });

  it("omits the disabled visual state when hasContent is true", () => {
    render(<AnimatedCopyButton {...defaultProps} hasContent={true} />);

    const button = screen.getByRole("button");
    expect(button.className).not.toContain(CSS_CLASSES.DISABLED_BUTTON_STATE);
  });

  it("does not call onCopy when disabled", () => {
    render(<AnimatedCopyButton {...defaultProps} hasContent={false} />);

    fireEvent.click(screen.getByRole("button"));

    expect(defaultProps.onCopy).not.toHaveBeenCalled();
  });

  it("has aria-label 'Copy to clipboard' when not copied", () => {
    render(<AnimatedCopyButton {...defaultProps} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-label", COPY_BUTTON_LABELS.COPY);
  });

  it("has aria-label 'Copied to clipboard' when copied", () => {
    render(<AnimatedCopyButton {...defaultProps} isCopied={true} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-label", COPY_BUTTON_LABELS.COPIED);
  });

  it("sets data-state and title attributes for micro-UX state tracking", () => {
    const { rerender } = render(<AnimatedCopyButton {...defaultProps} isCopied={false} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-state", COPY_STATE_VALUES.IDLE);
    expect(button).toHaveAttribute("title", COPY_BUTTON_LABELS.COPY);

    rerender(<AnimatedCopyButton {...defaultProps} isCopied={true} />);
    expect(button).toHaveAttribute("data-state", COPY_STATE_VALUES.COPIED);
    expect(button).toHaveAttribute("title", COPY_BUTTON_LABELS.COPIED);
  });

  it("has a screen reader live region for copy announcements", () => {
    render(<AnimatedCopyButton {...defaultProps} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("announces 'Copied to clipboard' via live region when copied", () => {
    render(<AnimatedCopyButton {...defaultProps} isCopied={true} />);

    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent(COPY_BUTTON_LABELS.COPIED);
  });

  it("has empty live region when not copied", () => {
    render(<AnimatedCopyButton {...defaultProps} />);

    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeEmptyDOMElement();
  });

  it("applies copied styling when isCopied is true", () => {
    render(<AnimatedCopyButton {...defaultProps} isCopied={true} />);

    const button = screen.getByRole("button");
    expect(button.className).toContain("accent-emerald");
  });

  it("renders with custom className", () => {
    render(<AnimatedCopyButton {...defaultProps} className="ml-2" />);

    const button = screen.getByRole("button");
    expect(button.className).toContain("ml-2");
  });

  it("spawns celebratory particles on click by default", () => {
    const { container } = render(<AnimatedCopyButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button"));

    const particles = container.querySelectorAll(".absolute.rounded-full.pointer-events-none");
    expect(particles.length).toBe(PARTICLE_CONFIG.COUNT);
  });

  it("skips particle burst when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<AnimatedCopyButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button"));

    expect(defaultProps.onCopy).toHaveBeenCalledTimes(1);
    const particles = container.querySelectorAll(".absolute.rounded-full.pointer-events-none");
    expect(particles.length).toBe(0);
  });

  it("omits button hover transform when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<AnimatedCopyButton {...defaultProps} hasContent={true} />);

    const buttonCall = vi.mocked(motion.button).mock.calls.at(-1)?.[0];
    expect(buttonCall?.whileHover).toBeUndefined();
  });

  it("applies button hover transform by default", () => {
    render(<AnimatedCopyButton {...defaultProps} hasContent={true} />);

    const buttonCall = vi.mocked(motion.button).mock.calls.at(-1)?.[0];
    expect(buttonCall?.whileHover).toEqual({ ...HOVER_SCALE.MICRO });
  });

  it("omits copy icon rotation when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<AnimatedCopyButton {...defaultProps} hasContent={true} />);

    const copyIconCall = vi.mocked(motion.svg).mock.calls.at(-1)?.[0];
    expect(copyIconCall?.whileHover).toBeUndefined();
  });
});
