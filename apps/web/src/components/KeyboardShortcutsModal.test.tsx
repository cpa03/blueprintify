import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { ACCESSIBILITY_LABELS } from "../config/constants/content";

vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    button: vi.fn(({ children, whileHover: _w1, whileTap: _w2, ...props }) => (
      <button {...props}>{children}</button>
    )),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

describe("KeyboardShortcutsModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dialog and search box when isOpen is true", () => {
    render(<KeyboardShortcutsModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(
      screen.getByLabelText(ACCESSIBILITY_LABELS.KEYBOARD_SHORTCUTS.CLOSE)
    ).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<KeyboardShortcutsModal {...defaultProps} isOpen={false} />);

    expect(container.innerHTML).toBe("");
  });

  it("keeps the modal open when typing '?' in the search field", () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />);

    const search = screen.getByRole("searchbox");
    fireEvent.keyDown(search, { key: "?" });
    fireEvent.change(search, { target: { value: "?" } });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(search).toHaveValue("?");
  });

  it("closes the modal when '?' is pressed outside the search field", () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />);

    fireEvent.keyDown(document, { key: "?" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("filters shortcuts as the query is typed", () => {
    render(<KeyboardShortcutsModal {...defaultProps} />);

    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "zzz-no-match" } });

    expect(
      screen.getByText(ACCESSIBILITY_LABELS.KEYBOARD_SHORTCUTS.NO_RESULTS("zzz-no-match"))
    ).toBeInTheDocument();
  });

  it("clears the search first when Escape is pressed with a query", () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />);

    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "export" } });
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
    expect(search).toHaveValue("");
  });

  it("closes the modal on a second Escape after clearing the search", () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />);

    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "export" } });
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes the modal on Escape when there is no search query", () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("focuses the search input on Ctrl+F", () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />);

    const search = screen.getByRole("searchbox");
    search.blur();
    fireEvent.keyDown(document, { key: "f", ctrlKey: true });

    expect(search).toHaveFocus();
  });

  it("lists the Ctrl/Cmd+S save-now shortcut", () => {
    render(<KeyboardShortcutsModal {...defaultProps} />);

    expect(screen.getByText("Save content now")).toBeInTheDocument();
  });
});
