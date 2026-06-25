import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("renders SVG with correct icon path for 'check'", () => {
    const { container } = render(<Icon name="check" />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");

    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("d");
  });

  it("renders multiple icons correctly", () => {
    const { container: c1 } = render(<Icon name="close" />);
    const { container: c2 } = render(<Icon name="edit" />);

    expect(c1.querySelector("svg")).toBeInTheDocument();
    expect(c2.querySelector("svg")).toBeInTheDocument();
  });

  it("renders null for unknown icon name", () => {
    const { container } = render(<Icon name={"nonexistent" as never} />);

    expect(container.querySelector("svg")).toBeNull();
  });

  it("sets aria-label when ariaLabel prop is provided", () => {
    render(<Icon name="check" ariaLabel="Checkmark icon" />);

    const svg = screen.getByLabelText("Checkmark icon");
    expect(svg).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Icon name="check" className="w-8 h-8 text-red-500" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("w-8", "h-8", "text-red-500");
  });

  it("applies custom strokeWidth", () => {
    const { container } = render(<Icon name="check" strokeWidth={1.5} />);

    const path = container.querySelector("path");
    expect(path).toHaveAttribute("stroke-width", "1.5");
  });
});
