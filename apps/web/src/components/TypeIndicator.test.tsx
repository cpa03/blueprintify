import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TypeIndicator, useTypingIndicator } from "./TypeIndicator";
import { act } from "react";

// ---------------------------------------------------------------------------
// useTypingIndicator hook tests
// ---------------------------------------------------------------------------

describe("useTypingIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns isTyping false initially", () => {
    let result: ReturnType<typeof useTypingIndicator> | undefined;

    function TestComponent(): null {
      result = useTypingIndicator();
      return null;
    }

    render(<TestComponent />);
    expect(result?.isTyping).toBe(false);
  });

  it("sets isTyping true on handleTyping", () => {
    let result: ReturnType<typeof useTypingIndicator> | undefined;

    function TestComponent(): null {
      result = useTypingIndicator({ delay: 1000 });
      return null;
    }

    render(<TestComponent />);

    act(() => {
      result?.handleTyping("new value");
    });

    expect(result?.isTyping).toBe(true);
  });

  it("resets isTyping false after delay", () => {
    let result: ReturnType<typeof useTypingIndicator> | undefined;

    function TestComponent(): null {
      result = useTypingIndicator({ delay: 1000 });
      return null;
    }

    render(<TestComponent />);

    act(() => {
      result?.handleTyping("new value");
    });
    expect(result?.isTyping).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result?.isTyping).toBe(false);
  });

  it("clears isTyping on handleBlur", () => {
    let result: ReturnType<typeof useTypingIndicator> | undefined;

    function TestComponent(): null {
      result = useTypingIndicator({ delay: 1000 });
      return null;
    }

    render(<TestComponent />);

    act(() => {
      result?.handleTyping("new value");
    });
    expect(result?.isTyping).toBe(true);

    act(() => {
      result?.handleBlur();
    });
    expect(result?.isTyping).toBe(false);
  });

  it("does not trigger typing if value is unchanged", () => {
    let result: ReturnType<typeof useTypingIndicator> | undefined;

    function TestComponent(): null {
      result = useTypingIndicator({ delay: 1000 });
      return null;
    }

    render(<TestComponent />);

    act(() => {
      result?.handleTyping("value");
    });
    expect(result?.isTyping).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result?.isTyping).toBe(false);

    act(() => {
      result?.handleTyping("value");
    });
    expect(result?.isTyping).toBe(false);
  });

  it("respects minInputLength option", () => {
    let result: ReturnType<typeof useTypingIndicator> | undefined;

    function TestComponent(): null {
      result = useTypingIndicator({ delay: 1000, minInputLength: 3 });
      return null;
    }

    render(<TestComponent />);

    act(() => {
      result?.handleTyping("ab");
    });
    expect(result?.isTyping).toBe(false);

    act(() => {
      result?.handleTyping("abc");
    });
    expect(result?.isTyping).toBe(true);
  });

  it("resets timeout on rapid successive calls", () => {
    let result: ReturnType<typeof useTypingIndicator> | undefined;

    function TestComponent(): null {
      result = useTypingIndicator({ delay: 1000 });
      return null;
    }

    render(<TestComponent />);

    act(() => {
      result?.handleTyping("a");
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result?.handleTyping("ab");
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should still be typing because the second call reset the timer
    expect(result?.isTyping).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result?.isTyping).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TypeIndicator component tests
// ---------------------------------------------------------------------------

vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, animate: _a, initial: _i, exit: _e, transition: _t, ...props }) => (
      <div {...props}>{children}</div>
    )),
    span: vi.fn(({ children, animate: _a, transition: _t, ...props }) => (
      <span {...props}>{children}</span>
    )),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

describe("TypeIndicator", () => {
  it("renders when isTyping is true", () => {
    render(<TypeIndicator isTyping={true} />);

    expect(screen.getByText("Typing")).toBeInTheDocument();
  });

  it("does not render when isTyping is false", () => {
    const { container } = render(<TypeIndicator isTyping={false} />);

    expect(container.innerHTML).toBe("");
  });

  it("has aria-live polite for accessibility", () => {
    const { container } = render(<TypeIndicator isTyping={true} />);

    const liveRegion = container.querySelector("[aria-live='polite']");
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
  });

  it("has screen reader text with 'Typing' label", () => {
    render(<TypeIndicator isTyping={true} />);

    const srSpan = screen.getByText("Typing");
    expect(srSpan.className).toContain("sr-only");
  });

  it("renders three animated dots", () => {
    const { container } = render(<TypeIndicator isTyping={true} />);

    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots.length).toBe(3);
  });

  it("applies right margin when position is left", () => {
    const { container } = render(<TypeIndicator isTyping={true} position="left" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.className).toContain("mr-2");
  });

  it("applies left margin when position is right (default)", () => {
    const { container } = render(<TypeIndicator isTyping={true} position="right" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.className).toContain("ml-2");
  });

  it("applies custom className", () => {
    const { container } = render(<TypeIndicator isTyping={true} className="mt-4" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.className).toContain("mt-4");
  });
});
