import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TypeIndicator, useTypingIndicator } from "./TypeIndicator";
import { act } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

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

let capturedDotAnimations: { animate: unknown; transition: unknown }[] = [];

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  span: vi.fn(({ children, animate, transition, ...props }: Record<string, unknown>) => {
    capturedDotAnimations.push({ animate, transition });
    return <span {...props}>{children as React.ReactNode}</span>;
  }),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

describe("TypeIndicator", () => {
  it("renders when isTyping is true", () => {
    render(<TypeIndicator isTyping={true} />);

    expect(screen.getByText("Typing")).toBeInTheDocument();
  });

  it("keeps an empty persistent live region mounted when isTyping is false", () => {
    const { container } = render(<TypeIndicator isTyping={false} />);

    const announcer = container.querySelector("[data-typing-announcer]");
    expect(announcer).toBeInTheDocument();
    expect(announcer).toHaveAttribute("aria-live", "polite");
    expect(announcer).toHaveAttribute("data-typing-announcer", "idle");
    expect(announcer?.textContent).toBe("");
    expect(container.querySelector("span.rounded-full")).toBeNull();
  });

  it("announces Typing via a live region that exists before content changes", () => {
    const { container, rerender } = render(<TypeIndicator isTyping={false} />);

    const announcerBefore = container.querySelector("[data-typing-announcer]");
    expect(announcerBefore).toBeInTheDocument();
    expect(announcerBefore).toHaveAttribute("role", "status");
    expect(announcerBefore).toHaveAttribute("aria-live", "polite");
    expect(announcerBefore).toHaveAttribute("aria-atomic", "true");

    rerender(<TypeIndicator isTyping={true} />);

    const announcerAfter = container.querySelector("[data-typing-announcer]");
    expect(announcerAfter).toBe(announcerBefore);
    expect(announcerAfter).toHaveAttribute("data-typing-announcer", "typing");
    expect(announcerAfter?.textContent).toBe("Typing");
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

  it("marks the visual dots container as decorative (aria-hidden)", () => {
    const { container } = render(<TypeIndicator isTyping={true} />);

    const visual = container.querySelector("[data-dots-count]");
    expect(visual).toBeInTheDocument();
    expect(visual).toHaveAttribute("aria-hidden", "true");
    expect(visual).not.toHaveAttribute("aria-live");
  });

  it("applies right margin when position is left", () => {
    const { container } = render(<TypeIndicator isTyping={true} position="left" />);

    const visual = container.querySelector("[data-position='left']");
    expect(visual?.className).toContain("mr-2");
  });

  it("applies left margin when position is right (default)", () => {
    const { container } = render(<TypeIndicator isTyping={true} position="right" />);

    const visual = container.querySelector("[data-position='right']");
    expect(visual?.className).toContain("ml-2");
  });

  it("applies custom className", () => {
    const { container } = render(<TypeIndicator isTyping={true} className="mt-4" />);

    const visual = container.querySelector("[data-dots-count]");
    expect(visual?.className).toContain("mt-4");
  });

  it("applies data-state, data-position, data-dots-count, and data-reduced-motion attributes for state tracking", () => {
    const { container } = render(<TypeIndicator isTyping={true} position="left" />);

    const visual = container.querySelector("[data-dots-count]");
    expect(visual).toHaveAttribute("data-state", "typing");
    expect(visual).toHaveAttribute("data-position", "left");
    expect(visual).toHaveAttribute("data-dots-count", "3");
    expect(visual).toHaveAttribute("data-reduced-motion", "false");
  });

  describe("reduced motion", () => {
    beforeEach(() => {
      capturedDotAnimations = [];
      vi.mocked(useReducedMotion).mockReset();
      vi.mocked(useReducedMotion).mockReturnValue(false);
    });

    it("animates three dots with an infinite bounce by default", () => {
      render(<TypeIndicator isTyping={true} />);

      expect(capturedDotAnimations).toHaveLength(3);
      const transition = capturedDotAnimations[0]?.transition as { repeat?: number } | undefined;
      expect(transition?.repeat).toBe(Infinity);
    });

    it("disables the infinite dot bounce when reduced motion is preferred", () => {
      vi.mocked(useReducedMotion).mockReturnValue(true);
      render(<TypeIndicator isTyping={true} />);

      expect(capturedDotAnimations).toHaveLength(3);
      capturedDotAnimations.forEach(({ animate, transition }) => {
        expect(animate).toEqual({});
        const t = transition as { repeat?: number } | undefined;
        expect(t?.repeat).toBeUndefined();
      });
    });

    it("keeps the typing announcement for screen readers when reduced motion is preferred", () => {
      vi.mocked(useReducedMotion).mockReturnValue(true);
      render(<TypeIndicator isTyping={true} />);

      expect(screen.getByText("Typing")).toBeInTheDocument();
    });
  });
});
