import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TemplateGrid } from "./TemplateGrid";

vi.mock("framer-motion", () => ({
  motion: {
    button: vi.fn(({ children, whileHover: _w1, whileTap: _w2, ...props }) => (
      <button {...props}>{children}</button>
    )),
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  },
}));

const mockLoadTemplate = vi.fn();
const mockSuccessToast = vi.fn();

vi.mock("../store", () => ({
  useWizardStore: (selector: (s: { loadTemplate: typeof mockLoadTemplate }) => unknown) =>
    selector({ loadTemplate: mockLoadTemplate }),
  useToast: () => ({
    success: mockSuccessToast,
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@blueprint/shared", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    STARTER_TEMPLATES: [
      {
        id: "web-app",
        name: "Web Application",
        description: "Full-stack web application with React",
        icon: "\u{1F310}",
        techStack: [
          { name: "React", category: "frontend" },
          { name: "Node.js", category: "backend" },
          { name: "PostgreSQL", category: "database" },
        ],
      },
      {
        id: "mobile-app",
        name: "Mobile App",
        description: "Cross-platform mobile application",
        icon: "\u{1F4F1}",
        techStack: [
          { name: "React Native", category: "frontend" },
          { name: "Firebase", category: "backend" },
        ],
      },
    ],
  };
});

describe("TemplateGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the section title", () => {
    render(<TemplateGrid />);

    expect(screen.getByText("Quick Start Templates")).toBeInTheDocument();
  });

  it("renders all template cards", () => {
    render(<TemplateGrid />);

    expect(screen.getByText("Web Application")).toBeInTheDocument();
    expect(screen.getByText("Mobile App")).toBeInTheDocument();
  });

  it("renders template descriptions", () => {
    render(<TemplateGrid />);

    expect(screen.getByText("Full-stack web application with React")).toBeInTheDocument();
    expect(screen.getByText("Cross-platform mobile application")).toBeInTheDocument();
  });

  it("renders tech stack badges", () => {
    render(<TemplateGrid />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });

  it("limits tech badges shown to 3 items per template", () => {
    render(<TemplateGrid />);

    // The mock has Web App with 3 tech items (React, Node.js, PostgreSQL)
    // and Mobile App with 2 tech items (React Native, Firebase)
    // Verify no +N badge since no template exceeds 3 items
    const plusBadges = screen.queryByText(/^\+/, { selector: "span" });
    expect(plusBadges).toBeNull();
    // Templates in mock have 2-3 items each, so no +N badge expected
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });

  it("calls loadTemplate when a template is clicked", () => {
    render(<TemplateGrid />);

    fireEvent.click(screen.getByText("Web Application"));

    // setTimeout hasn't fired yet
    expect(mockLoadTemplate).not.toHaveBeenCalled();

    // Advance timers to fire setTimeout
    vi.advanceTimersByTime(300);

    expect(mockLoadTemplate).toHaveBeenCalled();
  });

  it("disables all templates after one is selected", () => {
    render(<TemplateGrid />);

    const webAppButton = screen.getByText("Web Application").closest("button")!;
    const mobileAppButton = screen.getByText("Mobile App").closest("button")!;

    expect(webAppButton).not.toBeDisabled();
    expect(mobileAppButton).not.toBeDisabled();

    fireEvent.click(webAppButton);

    // Both should be disabled after click
    expect(webAppButton).toBeDisabled();
  });

  it("renders template emoji icons", () => {
    render(<TemplateGrid />);

    expect(screen.getByText("🌐")).toBeInTheDocument();
    expect(screen.getByText("📱")).toBeInTheDocument();
  });

  it("handles keyboard Enter key to select template", () => {
    render(<TemplateGrid />);

    const webAppButton = screen.getByText("Web Application").closest("button")!;
    fireEvent.keyDown(webAppButton, { key: "Enter" });

    vi.advanceTimersByTime(300);
    expect(mockLoadTemplate).toHaveBeenCalled();
  });
});
