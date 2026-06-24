import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShowEditorButton } from "./ShowEditorButton";
import { UI_CONTENT } from "../config/constants";

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

vi.mock("../lib/platform", () => ({
  getModifierLabel: () => "Ctrl",
  getAriaShortcutKey: () => "Ctrl+E",
  formatShortcut: () => "Ctrl+E",
}));

describe("ShowEditorButton", () => {
  const defaultProps = {
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the show editor button with correct label", () => {
    render(<ShowEditorButton {...defaultProps} />);

    expect(screen.getByText(UI_CONTENT.EDITOR.SHOW_EDITOR_BUTTON)).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ShowEditorButton onClick={onClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows keyboard shortcut modifier", () => {
    render(<ShowEditorButton {...defaultProps} />);

    expect(screen.getByText("Ctrl+E")).toBeInTheDocument();
  });

  it("shows pulsing indicator when isGenerating is true", () => {
    const { container } = render(<ShowEditorButton {...defaultProps} isGenerating={true} />);

    const pulseDot = container.querySelector("span.w-2.h-2");
    expect(pulseDot).toBeInTheDocument();
    expect(pulseDot?.className).toContain("animate-pulse");
  });

  it("does not show pulsing indicator when isGenerating is false", () => {
    const { container } = render(<ShowEditorButton {...defaultProps} isGenerating={false} />);

    const pulseDot = container.querySelector("span.w-2.h-2");
    expect(pulseDot).toBeNull();
  });

  it("shows View Blueprint label when hasContent is true", () => {
    render(<ShowEditorButton {...defaultProps} hasContent={true} />);

    expect(screen.getByText(UI_CONTENT.EDITOR.VIEW_BLUEPRINT_BUTTON)).toBeInTheDocument();
    expect(screen.queryByText(UI_CONTENT.EDITOR.SHOW_EDITOR_BUTTON)).not.toBeInTheDocument();
  });

  it("applies glow-pulse class when hasContent is true", () => {
    render(<ShowEditorButton {...defaultProps} hasContent={true} />);

    const button = screen.getByRole("button");
    expect(button.className).toContain("glow-pulse");
  });

  it("does not apply glow-pulse class when hasContent is false and not generating", () => {
    render(<ShowEditorButton {...defaultProps} hasContent={false} isGenerating={false} />);

    const button = screen.getByRole("button");
    expect(button.className).not.toContain("glow-pulse");
  });

  it("has aria-keyshortcuts attribute", () => {
    render(<ShowEditorButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-keyshortcuts", "Ctrl+E");
  });

  it("renders SVG icon for the edit action", () => {
    const { container } = render(<ShowEditorButton {...defaultProps} />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
