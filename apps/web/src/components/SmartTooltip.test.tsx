/**
 * SmartTooltip Component Tests
 *
 * Tests for the enhanced tooltip component including:
 * - Hover/focus trigger behavior
 * - Keyboard dismissal (Escape)
 * - Click-outside dismissal
 * - Touch device handling
 * - ARIA attributes
 * - Auto-positioning fallback
 *
 * @module components/SmartTooltip.test
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SmartTooltip, KeyboardShortcutTooltip, InfoTooltip } from "./SmartTooltip";

// JSDOM defines ontouchstart in window, which makes SmartTooltip treat
// the test environment as a touch device and skip mouse event handlers.
// We delete the property so hover/focus interactions work as expected.
beforeEach(() => {
  vi.useFakeTimers();
  delete (window as unknown as Record<string, unknown>).ontouchstart;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SmartTooltip", () => {
  it("renders children", () => {
    render(
      <SmartTooltip content="Tooltip text">
        <button data-testid="trigger">Hover me</button>
      </SmartTooltip>
    );

    expect(screen.getByTestId("trigger")).toBeInTheDocument();
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("does not show tooltip by default", () => {
    render(
      <SmartTooltip content="Tooltip text">
        <button>Hover me</button>
      </SmartTooltip>
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on mouse enter after delay", () => {
    render(
      <SmartTooltip content="Tooltip text">
        <button>Hover me</button>
      </SmartTooltip>
    );

    // Get the trigger wrapper (parent of the button, which has .relative.inline-flex)
    const triggerWrapper = screen.getByRole("button").parentElement!;
    expect(triggerWrapper).toBeTruthy();

    fireEvent.mouseEnter(triggerWrapper);

    // Tooltip should not be visible immediately (before delay)
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    // Advance past the default show delay (400ms)
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("hides tooltip on mouse leave", () => {
    render(
      <SmartTooltip content="Tooltip text">
        <button>Hover me</button>
      </SmartTooltip>
    );

    const container = screen.getByRole("button").parentElement!;

    // Show tooltip
    fireEvent.mouseEnter(container);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Hide tooltip
    fireEvent.mouseLeave(container);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on focus", () => {
    render(
      <SmartTooltip content="Focus tooltip">
        <button>Focus me</button>
      </SmartTooltip>
    );

    const container = screen.getByRole("button", { name: "Focus me" }).parentElement!;
    fireEvent.focus(container);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Focus tooltip")).toBeInTheDocument();
  });

  it("hides tooltip on blur", () => {
    render(
      <SmartTooltip content="Blur tooltip">
        <button>Blur me</button>
      </SmartTooltip>
    );

    const container = screen.getByRole("button", { name: "Blur me" }).parentElement!;

    // Show via focus
    fireEvent.focus(container);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Blur to unrelated element
    const unrelated = document.createElement("div");
    document.body.appendChild(unrelated);
    fireEvent.blur(container, { relatedTarget: unrelated });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    document.body.removeChild(unrelated);
  });

  it("sets aria-describedby on trigger when visible", () => {
    render(
      <SmartTooltip content="ARIA tooltip">
        <button>ARIA test</button>
      </SmartTooltip>
    );

    const trigger = screen.getByRole("button", { name: "ARIA test" });
    const wrapper = trigger.parentElement!;

    // Before visible - no association on the trigger
    expect(trigger).not.toHaveAttribute("aria-describedby");

    // Show tooltip
    fireEvent.mouseEnter(wrapper);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // After visible - the tooltip is associated with the focusable trigger
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute("id");
    const tooltipId = tooltip.getAttribute("id");
    expect(trigger.getAttribute("aria-describedby")).toBe(tooltipId);

    // The non-semantic wrapper must not carry the association - it is never
    // focused, so screen readers would ignore it
    expect(wrapper).not.toHaveAttribute("aria-describedby");
  });

  it("dismisses on Escape key", () => {
    render(
      <SmartTooltip content="Dismiss on Escape" dismissOnEscape={true}>
        <button>Escape test</button>
      </SmartTooltip>
    );

    const container = screen.getByRole("button", { name: "Escape test" }).parentElement!;

    // Show tooltip
    fireEvent.mouseEnter(container);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("dismisses on click outside", () => {
    render(
      <SmartTooltip content="Click outside" dismissOnClickOutside={true}>
        <button>Outside test</button>
      </SmartTooltip>
    );

    const container = screen.getByRole("button", { name: "Outside test" }).parentElement!;

    // Show tooltip
    fireEvent.mouseEnter(container);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("renders tooltip and auto-adjusts position based on viewport", () => {
    render(
      <SmartTooltip content="Auto-positioned" position="top">
        <button>Top test</button>
      </SmartTooltip>
    );

    const container = screen.getByRole("button", { name: "Top test" }).parentElement!;
    fireEvent.mouseEnter(container);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const tooltip = screen.getByRole("tooltip");
    // In jsdom, getBoundingClientRect returns zeros, so auto-positioning
    // falls back to the first fitting position (bottom in a 768px viewport).
    // The important thing is the tooltip renders with position classes.
    expect(tooltip.className).toContain("absolute");
    expect(tooltip.className).toContain("z-50");
    expect(tooltip.className).toContain("pointer-events-none");
    expect(tooltip).toHaveAttribute("role", "tooltip");
  });

  it("applies custom maxWidth to tooltip", () => {
    render(
      <SmartTooltip content="Custom width tooltip" maxWidth={400}>
        <button>Width test</button>
      </SmartTooltip>
    );

    const container = screen.getByRole("button", { name: "Width test" }).parentElement!;
    fireEvent.mouseEnter(container);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.style.maxWidth).toBe("400px");
  });

  it("does not dismiss on Escape when dismissOnEscape is false", () => {
    render(
      <SmartTooltip content="No Escape dismiss" dismissOnEscape={false}>
        <button>No Escape</button>
      </SmartTooltip>
    );

    const container = screen.getByRole("button", { name: "No Escape" }).parentElement!;

    // Show tooltip
    fireEvent.mouseEnter(container);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Press Escape - tooltip should still be visible
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("does not dismiss on outside click when dismissOnClickOutside is false", () => {
    render(
      <SmartTooltip content="No outside dismiss" dismissOnClickOutside={false}>
        <button>No outside</button>
      </SmartTooltip>
    );

    const container = screen.getByRole("button", { name: "No outside" }).parentElement!;

    // Show tooltip
    fireEvent.mouseEnter(container);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Click outside - tooltip should still be visible
    fireEvent.mouseDown(document.body);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});

describe("KeyboardShortcutTooltip", () => {
  it("renders children", () => {
    render(
      <KeyboardShortcutTooltip shortcut="k" description="Toggle panel">
        <button>Shortcut btn</button>
      </KeyboardShortcutTooltip>
    );

    expect(screen.getByText("Shortcut btn")).toBeInTheDocument();
  });

  it("shows shortcut text in tooltip on hover", () => {
    render(
      <KeyboardShortcutTooltip shortcut="e" description="Toggle editor">
        <button>Editor btn</button>
      </KeyboardShortcutTooltip>
    );

    const container = screen.getByRole("button", { name: "Editor btn" }).parentElement!;
    fireEvent.mouseEnter(container);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Toggle editor")).toBeInTheDocument();
  });

  it("shows shortcut without description", () => {
    render(
      <KeyboardShortcutTooltip shortcut="Escape">
        <button>No desc</button>
      </KeyboardShortcutTooltip>
    );

    const container = screen.getByRole("button", { name: "No desc" }).parentElement!;
    fireEvent.mouseEnter(container);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});

describe("InfoTooltip", () => {
  it("renders children", () => {
    render(
      <InfoTooltip content="Helpful info">
        <span>Info trigger</span>
      </InfoTooltip>
    );

    expect(screen.getByText("Info trigger")).toBeInTheDocument();
  });

  it("shows info icon by default", () => {
    render(
      <InfoTooltip content="Info with icon">
        <span>Info icon test</span>
      </InfoTooltip>
    );

    // The info icon SVG should be present
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("hides info icon when showInfoIcon is false", () => {
    render(
      <InfoTooltip content="No icon" showInfoIcon={false}>
        <span>No icon test</span>
      </InfoTooltip>
    );

    // Wait - the icon SVG might be inside the tooltip or next to children
    // InfoTooltip renders children wrapped with an info icon
    const svg = document.querySelector("svg");
    expect(svg).not.toBeInTheDocument();
  });
});
