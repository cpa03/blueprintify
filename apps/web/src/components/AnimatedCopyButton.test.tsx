import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnimatedCopyButton } from "./AnimatedCopyButton";

vi.mock("framer-motion", () => ({
  motion: {
    button: vi.fn(({ children, whileHover: _w1, whileTap: _w2, animate: _a, ...props }) => (
      <button {...props}>{children}</button>
    )),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    svg: vi.fn(({ children, ...props }) => <svg {...props}>{children}</svg>),
    path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
  },
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

  it("does not call onCopy when disabled", () => {
    render(<AnimatedCopyButton {...defaultProps} hasContent={false} />);

    fireEvent.click(screen.getByRole("button"));

    expect(defaultProps.onCopy).not.toHaveBeenCalled();
  });

  it("has aria-label 'Copy to clipboard' when not copied", () => {
    render(<AnimatedCopyButton {...defaultProps} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Copy to clipboard");
  });

  it("has aria-label 'Copied to clipboard' when copied", () => {
    render(<AnimatedCopyButton {...defaultProps} isCopied={true} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Copied to clipboard");
  });

  it("has aria-live polite attribute", () => {
    render(<AnimatedCopyButton {...defaultProps} />);

    expect(screen.getByRole("button")).toHaveAttribute("aria-live", "polite");
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
});
