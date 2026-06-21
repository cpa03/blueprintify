import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OfflineBanner } from "./OfflineBanner";
import { NETWORK_MESSAGES, ACCESSIBILITY_LABELS } from "../config/constants";

const mockOnlineStatus = vi.fn().mockReturnValue(true);

vi.mock("../hooks", () => ({
  useOnlineStatus: () => ({ isOnline: mockOnlineStatus() }),
}));

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

describe("OfflineBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnlineStatus.mockReturnValue(true);
  });

  it("does not render when online", () => {
    render(<OfflineBanner />);
    expect(screen.queryByText(NETWORK_MESSAGES.OFFLINE)).not.toBeInTheDocument();
  });

  it("renders offline message when offline", () => {
    mockOnlineStatus.mockReturnValue(false);
    render(<OfflineBanner />);
    expect(screen.getByText(NETWORK_MESSAGES.OFFLINE)).toBeInTheDocument();
  });

  it("hides the banner when dismiss button is clicked", () => {
    mockOnlineStatus.mockReturnValue(false);
    render(<OfflineBanner />);

    const dismissButton = screen.getByRole("button", {
      name: ACCESSIBILITY_LABELS.OFFLINE_BANNER.DISMISS,
    });
    fireEvent.click(dismissButton);

    expect(screen.queryByText(NETWORK_MESSAGES.OFFLINE)).not.toBeInTheDocument();
  });

  it("renders description text when offline", () => {
    mockOnlineStatus.mockReturnValue(false);
    render(<OfflineBanner />);
    expect(screen.getByText(ACCESSIBILITY_LABELS.OFFLINE_BANNER.DESCRIPTION)).toBeInTheDocument();
  });

  it("sets role=status with aria-live when visible", () => {
    mockOnlineStatus.mockReturnValue(false);
    render(<OfflineBanner />);

    const banner = screen.getByRole("status");
    expect(banner).toHaveAttribute("aria-live", "polite");
    expect(banner).toHaveAttribute("aria-atomic", "true");
  });

  it("has SVG icon when visible", () => {
    mockOnlineStatus.mockReturnValue(false);
    render(<OfflineBanner />);

    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });
});
