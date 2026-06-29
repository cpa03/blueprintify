import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ValidationCheckmark } from "./ValidationCheckmark";
import { VALIDATION_LABELS } from "../config/constants/validation";

vi.mock("framer-motion", () => ({
  motion: {
    span: vi.fn(({ children, animate: _a, initial: _i, exit: _e, transition: _t, ...props }) => (
      <span {...props}>{children}</span>
    )),
    path: vi.fn(({ children, animate: _a, initial: _i, transition: _t, ...props }) => (
      <path {...props}>{children}</path>
    )),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

describe("ValidationCheckmark", () => {
  it("renders checkmark when isValid is true", () => {
    render(<ValidationCheckmark isValid={true} />);

    const icon = screen.getByRole("img");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-label", VALIDATION_LABELS.FIELD_VALID);
  });

  it("renders invalid indicator when showInvalid and not valid", () => {
    render(<ValidationCheckmark isValid={false} showInvalid={true} />);

    const icon = screen.getByRole("img");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-label", VALIDATION_LABELS.FIELD_INVALID);
  });

  it("does not render when isValid is false and showInvalid is false", () => {
    const { container } = render(<ValidationCheckmark isValid={false} />);

    expect(container.innerHTML).toBe("");
  });

  it("uses custom aria-label when provided", () => {
    render(<ValidationCheckmark isValid={true} ariaLabel="Project name is valid" />);

    const icon = screen.getByRole("img");
    expect(icon).toHaveAttribute("aria-label", "Project name is valid");
  });

  it("uses custom invalidAriaLabel when provided", () => {
    render(
      <ValidationCheckmark
        isValid={false}
        showInvalid={true}
        invalidAriaLabel="Name needs more characters"
      />
    );

    const icon = screen.getByRole("img");
    expect(icon).toHaveAttribute("aria-label", "Name needs more characters");
  });

  it("renders valid checkmark SVG (check icon) when valid", () => {
    const { container } = render(<ValidationCheckmark isValid={true} />);

    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", expect.stringContaining("M5 13l4 4L19 7"));
  });

  it("renders invalid X SVG when invalid", () => {
    const { container } = render(<ValidationCheckmark isValid={false} showInvalid={true} />);

    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", expect.stringContaining("M6 18L18 6"));
  });

  it("applies valid CSS classes when isValid is true", () => {
    const { container } = render(<ValidationCheckmark isValid={true} />);

    const icon = container.querySelector("[role='img']");
    expect(icon?.className).toContain("accent-emerald");
  });

  it("applies invalid CSS classes when isValid is false and showInvalid is true", () => {
    const { container } = render(<ValidationCheckmark isValid={false} showInvalid={true} />);

    const icon = container.querySelector("[role='img']");
    expect(icon?.className).toContain("accent-pink");
  });

  it("uses smaller size for inline variant", () => {
    const { container } = render(<ValidationCheckmark isValid={true} size="inline" />);

    const icon = container.querySelector("[role='img']");
    expect(icon?.className).toContain("w-5");
  });

  it("uses larger size for input variant", () => {
    const { container } = render(<ValidationCheckmark isValid={true} size="input" />);

    const icon = container.querySelector("[role='img']");
    expect(icon?.className).toContain("w-6");
  });

  it("applies custom className", () => {
    const { container } = render(<ValidationCheckmark isValid={true} className="ml-2" />);

    const icon = container.querySelector("[role='img']");
    expect(icon?.className).toContain("ml-2");
  });
});
