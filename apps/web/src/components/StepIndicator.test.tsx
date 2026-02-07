import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StepIndicator } from "../components/StepIndicator";
import { useWizardStore } from "../store";

describe("StepIndicator", () => {
  it("renders all wizard steps", () => {
    render(<StepIndicator />);

    expect(screen.getByLabelText(/Project Info/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tech Stack/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Features/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Review/)).toBeInTheDocument();
  });

  it("marks current step as active", () => {
    useWizardStore.setState({ currentStep: "stack" });
    render(<StepIndicator />);

    const stackButton = screen.getByLabelText(/Tech Stack/);
    expect(stackButton).toHaveClass("bg-primary-500/20");
  });
});
