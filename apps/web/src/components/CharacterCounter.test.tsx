import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CharacterCounter, CharacterCounterCompact } from "./CharacterCounter";

vi.mock("framer-motion", () => ({
  motion: {
    span: vi.fn(({ children, animate: _a, transition: _t, ...props }) => (
      <span {...props}>{children}</span>
    )),
    div: vi.fn(({ children, animate: _a, transition: _t, ...props }) => (
      <div {...props}>{children}</div>
    )),
  },
}));

describe("CharacterCounter", () => {
  it("renders current and max values", () => {
    render(<CharacterCounter current={5} max={100} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("/100")).toBeInTheDocument();
  });

  it("renders screen reader status with descriptive label", () => {
    render(<CharacterCounter current={5} max={100} />);
    const srStatus = screen.getByRole("status");
    expect(srStatus).toHaveClass("sr-only");
    expect(srStatus).toHaveAttribute("aria-live", "polite");
    expect(srStatus).toHaveAttribute("aria-atomic", "true");
    expect(srStatus).toHaveTextContent("5 of 100 characters used");
  });

  it("shows remaining count in sr text when 10 or fewer characters remain", () => {
    render(<CharacterCounter current={95} max={100} />);
    const srStatus = screen.getByRole("status");
    expect(srStatus).toHaveTextContent("5 remaining");
  });

  it("shows limit reached message in sr text when at max", () => {
    render(<CharacterCounter current={100} max={100} />);
    const srStatus = screen.getByRole("status");
    expect(srStatus).toHaveTextContent("limit reached");
  });

  it("applies warning color class on the outer container", () => {
    const { container } = render(<CharacterCounter current={85} max={100} />);
    const outerSpan = container.querySelector("[aria-hidden]");
    expect(outerSpan?.className).toContain("text-yellow-500");
  });

  it("applies emerald color when above minimum and valid", () => {
    const { container } = render(<CharacterCounter current={50} max={100} min={10} />);
    const outerSpan = container.querySelector("[aria-hidden]");
    expect(outerSpan?.className).toContain("text-accent-emerald");
  });

  it("applies pink color and bold inner text when at limit", () => {
    render(<CharacterCounter current={100} max={100} />);
    const innerSpan = screen.getByText("100");
    expect(innerSpan.className).toContain("font-bold");
    const outerSpan = innerSpan.closest("[aria-hidden]");
    expect(outerSpan?.className).toContain("text-accent-pink");
  });

  it("renders warning icon when at limit", () => {
    render(<CharacterCounter current={100} max={100} />);
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("applies default dark color when empty and no min", () => {
    const { container } = render(<CharacterCounter current={0} max={100} />);
    const outerSpan = container.querySelector("[aria-hidden]");
    expect(outerSpan?.className).toContain("text-dark-500");
  });

  it("marks visual counter as aria-hidden", () => {
    const { container } = render(<CharacterCounter current={5} max={100} />);
    const visualParent = container.querySelector("[aria-hidden]");
    expect(visualParent).toHaveAttribute("aria-hidden", "true");
  });
});

describe("CharacterCounterCompact", () => {
  it("renders current and max values", () => {
    render(<CharacterCounterCompact current={30} max={100} />);
    expect(screen.getByText("30/100")).toBeInTheDocument();
  });

  it("renders progress bar", () => {
    render(<CharacterCounterCompact current={50} max={100} />);
    const progressBar = document.querySelector("div.rounded-full > div");
    expect(progressBar).toBeInTheDocument();
  });

  it("renders screen reader status", () => {
    render(<CharacterCounterCompact current={5} max={100} />);
    const srStatus = screen.getByRole("status");
    expect(srStatus).toHaveTextContent("5 of 100 characters used");
  });
});
