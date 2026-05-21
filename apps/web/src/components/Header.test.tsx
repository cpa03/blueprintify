import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Header } from "./Header";

vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    nav: vi.fn(({ children, ...props }) => <nav {...props}>{children}</nav>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    button: vi.fn(({ children, ...props }) => (
      <button {...props}>{children}</button>
    )),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header with proper structure", () => {
    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("fixed", "top-0", "left-0", "right-0", "z-50");
  });

  it("renders the application title and subtitle", () => {
    render(<Header />);

    expect(screen.getByText("Blueprintify")).toBeInTheDocument();
    expect(
      screen.getByText("AI-Powered Project Architecture"),
    ).toBeInTheDocument();
  });

  it("renders the logo icon", () => {
    render(<Header />);

    const logoIcon = document.querySelector("svg");
    expect(logoIcon).toBeInTheDocument();
    expect(logoIcon).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("renders the GitHub button", () => {
    render(<Header />);

    const githubButton = screen.getByRole("button", {
      name: /view on github/i,
    });
    expect(githubButton).toBeInTheDocument();
    expect(githubButton).toHaveAttribute("aria-label", "View on GitHub");
  });

  it("renders GitHub icon", () => {
    render(<Header />);

    const githubIcon = document.querySelectorAll("svg")[1];
    expect(githubIcon).toBeInTheDocument();
    expect(githubIcon).toHaveAttribute("fill", "currentColor");
  });

  it("has proper styling classes", () => {
    const { container } = render(<Header />);

    const header = container.querySelector("header");
    expect(header).toHaveClass(
      "glass-card",
      "border-b",
      "border-dark-700/50",
      "backdrop-blur-xl",
    );
  });

  it("has responsive layout classes", () => {
    const { container } = render(<Header />);

    const mainContainer = container.querySelector(".max-w-7xl");
    expect(mainContainer).toHaveClass(
      "mx-auto",
      "px-6",
      "py-4",
      "flex",
      "items-center",
      "justify-between",
    );
  });

  it("has logo container with proper classes", () => {
    const { container } = render(<Header />);

    const logoContainer = container.querySelector(".flex.items-center.gap-3");
    expect(logoContainer).toBeInTheDocument();
  });

  it("has navigation with proper classes", () => {
    const { container } = render(<Header />);

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("flex", "items-center", "gap-2");
  });
});
