import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { StartFromScratchButton } from "./StartFromScratchButton";
import { UI_CONTENT } from "../config/constants/content";

describe("StartFromScratchButton", () => {
  it("renders the templates divider text as a real button with accessible attributes", () => {
    render(<StartFromScratchButton onStart={vi.fn()} />);

    const button = screen.getByRole("button", { name: UI_CONTENT.TEMPLATES_DIVIDER });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-label", UI_CONTENT.TEMPLATES_DIVIDER);
    expect(button).toHaveAttribute("data-state", "idle");
    expect(button).toHaveAttribute("data-reduced-motion");
  });

  it("calls onStart when activated by click", () => {
    const onStart = vi.fn();
    render(<StartFromScratchButton onStart={onStart} />);

    fireEvent.click(screen.getByRole("button", { name: UI_CONTENT.TEMPLATES_DIVIDER }));

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("calls onStart when activated by keyboard (Enter)", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<StartFromScratchButton onStart={onStart} />);

    await user.tab();
    await user.keyboard("{Enter}");

    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
