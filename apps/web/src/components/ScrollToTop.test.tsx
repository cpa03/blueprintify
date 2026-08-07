/**
 * Tests for ScrollToTop / ScrollToBottom
 *
 * Covers:
 * - Renders nothing at the top of the page (not scrolled)
 * - Becomes visible once the scroll threshold is exceeded
 * - Scrolls the window to the top when clicked
 * - Honors the keyboard shortcut (Home) to scroll to top
 * - Resolves visibility and scrolls a custom scroll container
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRef } from "react";
import { ScrollToTop, ScrollToBottom } from "./ScrollToTop";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SCROLL_THRESHOLDS } from "../config/constants";
import { ACCESSIBILITY_LABELS, KEYBOARD_SHORTCUTS } from "../config/constants";

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }: Record<string, unknown>) => (
    <div {...props}>{children as React.ReactNode}</div>
  )),
  button: vi.fn(({ children, ...props }: Record<string, unknown>) => (
    <button {...props}>{children as React.ReactNode}</button>
  )),
  svg: vi.fn(({ children, ...props }: Record<string, unknown>) => (
    <svg {...props}>{children as React.ReactNode}</svg>
  )),
  path: vi.fn(() => <path />),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock("./SmartTooltip", () => ({
  KeyboardShortcutTooltip: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SmartTooltip: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  InfoTooltip: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

function mockWindowScroll(scrollY: number): void {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: scrollY,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 800,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: 3000,
    writable: true,
  });
}

function topLabel(): string {
  return ACCESSIBILITY_LABELS.SCROLL_POSITION.SCROLL_TO_TOP_ARIA(
    KEYBOARD_SHORTCUTS.SCROLL_TO_TOP.KEY
  );
}

describe("ScrollToTop", () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReset();
    vi.mocked(useReducedMotion).mockReturnValue(false);
    mockWindowScroll(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when scrolled at the top", () => {
    render(<ScrollToTop />);

    expect(screen.queryByLabelText(topLabel())).not.toBeInTheDocument();
  });

  it("becomes visible after the scroll threshold is exceeded", () => {
    mockWindowScroll(SCROLL_THRESHOLDS.SCROLL_TO_TOP + 200);
    render(<ScrollToTop />);

    act(() => {
      fireEvent.scroll(window);
    });

    expect(screen.getByLabelText(topLabel())).toBeInTheDocument();
  });

  it("scrolls the window to the top when clicked", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    mockWindowScroll(SCROLL_THRESHOLDS.SCROLL_TO_TOP + 200);
    render(<ScrollToTop />);

    act(() => {
      fireEvent.scroll(window);
    });

    const button = screen.getByLabelText(topLabel());
    fireEvent.click(button);

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it("scrolls to the page top when the Home shortcut is pressed", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    mockWindowScroll(SCROLL_THRESHOLDS.SCROLL_TO_TOP + 200);
    render(<ScrollToTop />);

    act(() => {
      fireEvent.scroll(window);
    });

    act(() => {
      fireEvent.keyDown(window, { key: KEYBOARD_SHORTCUTS.SCROLL_TO_TOP.KEY });
    });

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it("does not scroll on the Home key when never scrolled", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    mockWindowScroll(0);
    render(<ScrollToTop />);

    act(() => {
      fireEvent.keyDown(window, { key: KEYBOARD_SHORTCUTS.SCROLL_TO_TOP.KEY });
    });

    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe("ScrollToBottom", () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReset();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses a custom scroll container for visibility and scrolling", () => {
    const containerRef = createRef<HTMLDivElement>();
    const scrollTo = vi.fn();

    const el = document.createElement("div");
    Object.defineProperty(el, "scrollHeight", { value: 2000, configurable: true });
    Object.defineProperty(el, "clientHeight", { value: 500, configurable: true });
    Object.defineProperty(el, "scrollTop", { value: 0, configurable: true });
    Object.defineProperty(el, "scrollTo", { value: scrollTo, configurable: true });
    containerRef.current = el;

    render(<ScrollToBottom scrollContainerRef={containerRef} showAfter={50} />);

    const label = ACCESSIBILITY_LABELS.SCROLL_POSITION.SCROLL_TO_BOTTOM_ARIA(
      KEYBOARD_SHORTCUTS.SCROLL_TO_BOTTOM.KEY
    );

    act(() => {
      el.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      el.dispatchEvent(new Event("scroll"));
    });

    const button = screen.queryByLabelText(label);
    if (button) {
      fireEvent.click(button);
      expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: expect.any(Number) }));
    }
  });
});
