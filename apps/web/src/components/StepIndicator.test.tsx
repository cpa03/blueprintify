import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { StepIndicator } from "./StepIndicator";
import { useWizardStore } from "../store";
import type { WizardStore } from "../store/wizard";

vi.mock("../store", () => ({
  useWizardStore: vi.fn(),
  useToast: () => ({
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("../config/constants", () => ({
  WIZARD_STEPS: [
    { key: "info", label: "Project Info", icon: "📋", shortcut: "1" },
    { key: "stack", label: "Tech Stack", icon: "🛠️", shortcut: "2" },
    { key: "features", label: "Features", icon: "✨", shortcut: "3" },
    { key: "review", label: "Review", icon: "👀", shortcut: "4" },
    { key: "generating", label: "Generating", icon: "⚡", shortcut: "5" },
  ],
  SPRING_CONFIG: {
    DEFAULT: { stiffness: 400, damping: 25, mass: 0.8 },
    REDUCED_MOTION: { stiffness: 1000, damping: 100, mass: 0.1 },
    SNAPPY: { stiffness: 500, damping: 25, mass: 0.8 },
    GENTLE: { stiffness: 400, damping: 30, mass: 0.8 },
    BOUNCY: { stiffness: 400, damping: 10, mass: 0.8 },
    SUBTLE_BOUNCE: { stiffness: 400, damping: 17, mass: 0.8 },
    SLOW: { stiffness: 100, damping: 20, mass: 0.8 },
  },
  TIMEOUTS: {
    SHAKE_ANIMATION: 400,
  },
  PROGRESS_COLORS: {
    COMPLETED: "#10b981",
    ACTIVE: "#6366f1",
  },
}));

vi.mock("framer-motion", () => {
  const motion = {
    button: vi.fn(
      ({
        children,
        onClick,
        disabled,
        whileHover: _whileHover,
        whileTap: _whileTap,
        ...props
      }) => (
        <button {...props} onClick={onClick} disabled={disabled}>
          {children}
        </button>
      ),
    ),
    div: vi.fn(
      ({
        children,
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        whileHover: _whileHover,
        whileTap: _whileTap,
        ...props
      }) => <div {...props}>{children}</div>,
    ),
    circle: vi.fn(
      ({
        initial: _initial,
        animate: _animate,
        transition: _transition,
        ...props
      }) => <circle {...props} />,
    ),
    span: vi.fn(
      ({
        children,
        initial: _initial,
        animate: _animate,
        transition: _transition,
        ...props
      }) => <span {...props}>{children}</span>,
    ),
  };
  return {
    motion,
    AnimatePresence: vi.fn(({ children }) => <>{children}</>),
  };
});

const mockWizardStore: WizardStore = {
  currentStep: "info" as const,
  projectName: "",
  description: "",
  techStack: [],
  features: [],
  targetAudience: "",
  constraints: "",
  setStep: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  setProjectName: vi.fn(),
  setDescription: vi.fn(),
  addTechStack: vi.fn(),
  removeTechStack: vi.fn(),
  setTechStack: vi.fn(),
  addFeature: vi.fn(),
  removeFeature: vi.fn(),
  clearFeatures: vi.fn(),
  setTargetAudience: vi.fn(),
  setConstraints: vi.fn(),
  reset: vi.fn(),
  loadTemplate: vi.fn(),
};

describe("StepIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useWizardStore as unknown as Mock).mockImplementation(
      (selector: (state: WizardStore) => unknown) => selector(mockWizardStore),
    );
  });

  it("renders all steps", () => {
    render(<StepIndicator />);

    expect(screen.getByText("Project Info")).toBeInTheDocument();
    expect(screen.getByText("Tech Stack")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Generating")).toBeInTheDocument();
  });

  it("displays step icons", () => {
    render(<StepIndicator />);

    expect(screen.getByText("📋")).toBeInTheDocument();
    expect(screen.getByText("🛠️")).toBeInTheDocument();
    expect(screen.getByText("✨")).toBeInTheDocument();
    expect(screen.getByText("👀")).toBeInTheDocument();
    expect(screen.getByText("⚡")).toBeInTheDocument();
  });

  it("highlights current step as active", () => {
    mockWizardStore.currentStep = "stack";
    render(<StepIndicator />);

    const stackButton = screen.getByText("Tech Stack").closest("button");
    expect(stackButton).toHaveClass(
      "bg-primary-500/20",
      "border-primary-500/50",
      "text-primary-300",
    );
  });

  it("marks completed steps as completed", () => {
    mockWizardStore.currentStep = "features";
    render(<StepIndicator />);

    const infoButton = screen.getByText("Project Info").closest("button");
    const stackButton = screen.getByText("Tech Stack").closest("button");

    expect(infoButton).toHaveClass(
      "bg-accent-emerald/20",
      "border-accent-emerald/50",
      "text-accent-emerald",
    );
    expect(stackButton).toHaveClass(
      "bg-accent-emerald/20",
      "border-accent-emerald/50",
      "text-accent-emerald",
    );
  });

  it("shows uncompleted steps as locked", () => {
    mockWizardStore.currentStep = "features";
    render(<StepIndicator />);

    const reviewButton = screen.getByText("Review").closest("button");
    const generatingButton = screen.getByText("Generating").closest("button");

    expect(reviewButton).toHaveClass(
      "bg-dark-800/50",
      "border-dark-700",
      "text-dark-300",
    );
    expect(generatingButton).toHaveClass(
      "bg-dark-800/50",
      "border-dark-700",
      "text-dark-300",
    );
  });

  it("allows navigation to completed and current steps", () => {
    mockWizardStore.currentStep = "features";
    render(<StepIndicator />);

    const infoButton = screen.getByText("Project Info").closest("button");
    const stackButton = screen.getByText("Tech Stack").closest("button");
    const featuresButton = screen.getByText("Features").closest("button");

    expect(infoButton).not.toBeDisabled();
    expect(stackButton).not.toBeDisabled();
    expect(featuresButton).not.toBeDisabled();
  });

  it("disables navigation to future steps", () => {
    mockWizardStore.currentStep = "features";
    render(<StepIndicator />);

    const reviewButton = screen.getByText("Review").closest("button");
    const generatingButton = screen.getByText("Generating").closest("button");

    expect(reviewButton).toBeDisabled();
    expect(generatingButton).toBeDisabled();
  });

  it("calls setStep when clicking on a clickable step", () => {
    mockWizardStore.currentStep = "features";
    render(<StepIndicator />);

    const infoButton = screen.getByText("Project Info").closest("button");
    fireEvent.click(infoButton!);

    expect(mockWizardStore.setStep).toHaveBeenCalledWith("info");
  });

  it("disables generating step navigation", () => {
    mockWizardStore.currentStep = "generating";
    render(<StepIndicator />);

    const generatingButton = screen.getByText("Generating").closest("button");
    expect(generatingButton).toBeDisabled();
  });

  it("shows keyboard shortcuts for clickable steps", () => {
    mockWizardStore.currentStep = "features";
    render(<StepIndicator />);

    expect(screen.getByText("Alt+1")).toBeInTheDocument();
    expect(screen.getByText("Alt+2")).toBeInTheDocument();
    expect(screen.getByText("Alt+3")).toBeInTheDocument();
  });

  it("hides keyboard shortcuts for non-clickable steps", () => {
    mockWizardStore.currentStep = "features";
    render(<StepIndicator />);

    const reviewButton = screen.getByText("Review").closest("button");
    const shortcutText = reviewButton?.querySelector(".font-mono");
    expect(shortcutText).not.toBeInTheDocument();
  });

  it("has proper styling classes", () => {
    const { container } = render(<StepIndicator />);

    const stepIndicator = container.firstChild;
    expect(stepIndicator).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "gap-3",
      "mb-8",
    );
  });

  it("renders connector lines between steps", () => {
    const { container } = render(<StepIndicator />);

    const connectors = container.querySelectorAll(
      ".bg-accent-emerald, .bg-dark-700",
    );
    expect(connectors.length).toBeGreaterThan(0);
  });
});
