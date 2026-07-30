import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Header } from "./Header";
import { UI_CONTENT, ACCESSIBILITY_LABELS } from "../config/constants";

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    nav: vi.fn(({ children, ...props }) => <nav {...props}>{children}</nav>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    button: vi.fn(({ children, whileHover: _whileHover, whileTap: _whileTap, ...props }) => (
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

    expect(screen.getByText(UI_CONTENT.APP.NAME)).toBeInTheDocument();
    expect(screen.getByText("AI-Powered Project Architecture")).toBeInTheDocument();
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
    expect(githubButton).toHaveAttribute("aria-label", "View on GitHub (opens in new tab)");
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
    expect(header).toHaveClass("glass-card", "border-b", "border-dark-700/50", "backdrop-blur-xl");
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
      "justify-between"
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

  it("renders the brand button with scroll-to-top aria label", () => {
    render(<Header />);

    const brandButton = screen.getByRole("button", {
      name: ACCESSIBILITY_LABELS.HEADER.BRAND_SCROLL_TO_TOP,
    });
    expect(brandButton).toBeInTheDocument();
    expect(brandButton).toHaveClass("cursor-pointer");
  });

  it("scrolls to top when brand button is clicked", async () => {
    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;
    Object.defineProperty(window, "scrollY", { value: 500, writable: true });

    const user = userEvent.setup();
    render(<Header />);

    const brandButton = screen.getByRole("button", {
      name: ACCESSIBILITY_LABELS.HEADER.BRAND_SCROLL_TO_TOP,
    });

    await user.click(brandButton);

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("scrolls to top with auto behavior when reduced motion is preferred", async () => {
    const useReducedMotionMock = vi.mocked(
      (await import("../hooks/useReducedMotion")).useReducedMotion
    );
    useReducedMotionMock.mockReturnValue(true);

    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;
    Object.defineProperty(window, "scrollY", { value: 300, writable: true });

    const user = userEvent.setup();
    render(<Header />);

    const brandButton = screen.getByRole("button", {
      name: ACCESSIBILITY_LABELS.HEADER.BRAND_SCROLL_TO_TOP,
    });

    await user.click(brandButton);

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: "auto",
    });

    useReducedMotionMock.mockReturnValue(false);
  });
});
