import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SkipLink } from "./SkipLink";
import { Z_INDEX } from "../config/theme";

describe("SkipLink", () => {
  it("renders a link with correct href", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#main-content");
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
});
