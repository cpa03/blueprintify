import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DATA_BOOLEAN_VALUES, SKIP_LINK_STATE_VALUES } from "@blueprint/shared";
import { SkipLink } from "./SkipLink";
import { Z_INDEX } from "../config/theme";
import { useReducedMotion } from "../hooks/useReducedMotion";

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

const getArrow = (): SVGSVGElement | null => document.querySelector("a svg");
const getGlow = (): HTMLElement | null => document.querySelector("a > span.absolute");

describe("SkipLink", () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("renders a link with correct href, target attribute, default idle state, and data-reduced-motion", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#main-content");
    expect(link).toHaveAttribute("data-target", "main-content");
    expect(link).toHaveAttribute("data-state", SKIP_LINK_STATE_VALUES.IDLE);
    expect(link).toHaveAttribute("data-visible", "false");
    expect(link).toHaveAttribute("data-reduced-motion", DATA_BOOLEAN_VALUES.FALSE);
  });

  it("updates data-state and data-visible on focus and blur", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("data-state", SKIP_LINK_STATE_VALUES.IDLE);
    expect(link).toHaveAttribute("data-visible", "false");

    act(() => {
      fireEvent.focus(link);
    });
    expect(link).toHaveAttribute("data-state", SKIP_LINK_STATE_VALUES.FOCUSED);
    expect(link).toHaveAttribute("data-visible", "true");

    act(() => {
      fireEvent.blur(link);
    });
    expect(link).toHaveAttribute("data-state", SKIP_LINK_STATE_VALUES.IDLE);
    expect(link).toHaveAttribute("data-visible", "false");
  });

  it("renders skip link text", () => {
    render(<SkipLink />);
    expect(screen.getByText("Skip to main content")).toBeInTheDocument();
  });

  it("has sr-only class by default (only visible on focus)", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("sr-only");
  });

  it("has focus-visible:not-sr-only for keyboard accessibility", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("focus:not-sr-only");
  });

  it("renders arrow icon SVG", () => {
    render(<SkipLink />);
    const svg = document.querySelector("a svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("includes inline style tag for animations", () => {
    render(<SkipLink />);
    const styleTag = document.querySelector("style");
    expect(styleTag).toBeInTheDocument();
    expect(styleTag?.textContent).toBeTruthy();
  });

  it("has high z-index for focus state", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link");
    expect(link.style.zIndex).toBe(String(Z_INDEX.max));
  });

  it("does not run its decorative animations while the skip link is idle", () => {
    render(<SkipLink />);
    expect(getArrow()).toBeInTheDocument();
    expect(getGlow()).toBeInTheDocument();
    expect(getArrow()?.style.animation).toBe("none");
    expect(getGlow()?.style.animation).toBe("none");
  });

  it("starts the arrow bounce and glow pulse only while the skip link is focused", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link");

    act(() => {
      fireEvent.focus(link);
    });
    // CSSOM reorders the animation shorthand on read-back, so assert the
    // name and iteration count rather than the full serialized string.
    expect(getArrow()?.style.animation).toContain("skip-arrow-bounce");
    expect(getGlow()?.style.animation).toContain("skip-glow-pulse");
    expect(getArrow()?.style.animation).toContain("infinite");
    expect(getGlow()?.style.animation).toContain("infinite");

    act(() => {
      fireEvent.blur(link);
    });
    expect(getArrow()?.style.animation).toBe("none");
    expect(getGlow()?.style.animation).toBe("none");
  });

  it("keeps both animations off while focused when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<SkipLink />);
    const link = screen.getByRole("link");

    act(() => {
      fireEvent.focus(link);
    });
    expect(getArrow()?.style.animation).toBe("none");
    expect(getGlow()?.style.animation).toBe("none");
  });
});
