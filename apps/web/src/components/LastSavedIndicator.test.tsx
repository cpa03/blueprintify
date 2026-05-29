import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LastSavedIndicator } from "./LastSavedIndicator";

vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    svg: vi.fn(({ children, ...props }) => <svg {...props}>{children}</svg>),
    path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

describe("LastSavedIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders saved text when visible and no changes", () => {
    render(<LastSavedIndicator text="Last saved: 2:30 PM" isVisible={true} />);

    expect(screen.getByText("Last saved: 2:30 PM")).toBeInTheDocument();
  });

  it("renders 'Unsaved changes' when hasChanges is true", () => {
    render(<LastSavedIndicator text="Last saved: 2:30 PM" isVisible={true} hasChanges={true} />);

    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(screen.queryByText("Last saved: 2:30 PM")).not.toBeInTheDocument();
  });

  it("does not render anything when isVisible is false", () => {
    const { container } = render(
      <LastSavedIndicator text="Last saved: 2:30 PM" isVisible={false} />
    );

    expect(container.innerHTML).toBe("");
  });

  it("has aria-live polite and aria-atomic attributes", () => {
    render(<LastSavedIndicator text="Saved" isVisible={true} />);

    const region = screen.getByText("Saved").closest("[aria-live]");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
  });

  it("applies amber styling for unsaved changes", () => {
    render(<LastSavedIndicator text="Saved" isVisible={true} hasChanges={true} />);

    const container = screen.getByText("Unsaved changes").closest("div");
    expect(container?.className).toContain("text-amber-400");
  });

  it("applies dark-400 styling for saved state", () => {
    render(<LastSavedIndicator text="Saved" isVisible={true} />);

    const container = screen.getByText("Saved").closest("div");
    expect(container?.className).toContain("text-dark-400");
  });

  it("renders checkmark SVG in saved state", () => {
    const { container } = render(<LastSavedIndicator text="Saved" isVisible={true} />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders pulsing dot in unsaved state", () => {
    const { container } = render(
      <LastSavedIndicator text="Saved" isVisible={true} hasChanges={true} />
    );

    const pingEl = container.querySelector(".animate-ping");
    expect(pingEl).toBeInTheDocument();
  });

  it("accepts custom text prop", () => {
    render(<LastSavedIndicator text="Custom save text" isVisible={true} />);

    expect(screen.getByText("Custom save text")).toBeInTheDocument();
  });
});
