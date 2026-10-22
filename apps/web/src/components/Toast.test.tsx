import { TOAST_TYPES } from "@blueprint/shared/config";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ToastContainer } from "./Toast";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { TOAST_CONFIG } from "../config/constants";

vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    button: vi.fn(({ children, whileHover: _w1, whileTap: _w2, ...props }) => (
      <button {...props}>{children}</button>
    )),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

const mockToasts: Array<{
  id: string;
  message: string;
  type: string;
  duration?: number;
  ariaLabel?: string;
}> = [];

const mockRemoveToast = vi.fn();
const mockClearAll = vi.fn();

vi.mock("../store/toast", () => ({
  useToastStore: (selector: (state: unknown) => unknown) =>
    selector({
      toasts: mockToasts,
      addToast: vi.fn(),
      removeToast: mockRemoveToast,
      clearAll: mockClearAll,
    }),
  useToast: () => ({
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("ToastContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useReducedMotion).mockReturnValue(false);
    mockToasts.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when toasts array is empty", () => {
    render(<ToastContainer />);

    // Container div renders but no toast alerts should be present
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders toast messages", () => {
    mockToasts.push({
      id: "toast-1",
      message: "Operation successful!",
      type: TOAST_TYPES.SUCCESS,
    });

    render(<ToastContainer />);

    expect(screen.getByText("Operation successful!")).toBeInTheDocument();
  });

  it("renders multiple toasts", () => {
    mockToasts.push(
      { id: "toast-1", message: "First toast", type: TOAST_TYPES.SUCCESS },
      { id: "toast-2", message: "Second toast", type: TOAST_TYPES.ERROR }
    );

    render(<ToastContainer />);

    expect(screen.getByText("First toast")).toBeInTheDocument();
    expect(screen.getByText("Second toast")).toBeInTheDocument();
  });

  it("calls removeToast when dismiss button is clicked", () => {
    mockToasts.push({
      id: "toast-1",
      message: "Dismiss me",
      type: TOAST_TYPES.WARNING,
    });

    render(<ToastContainer />);

    const dismissButton = screen.getByRole("button", { name: /dismiss/i });
    fireEvent.click(dismissButton);

    expect(mockRemoveToast).toHaveBeenCalledWith("toast-1");
  });

  it("renders dismiss all button when multiple toasts exist", () => {
    mockToasts.push(
      { id: "toast-1", message: "Toast 1", type: TOAST_TYPES.INFO },
      { id: "toast-2", message: "Toast 2", type: TOAST_TYPES.SUCCESS }
    );

    render(<ToastContainer />);

    const dismissAll = screen.getByText(/dismiss all/i);
    expect(dismissAll).toBeInTheDocument();
  });

  it("calls clearAll when dismiss all button is clicked", () => {
    mockToasts.push(
      { id: "toast-1", message: "Toast 1", type: TOAST_TYPES.INFO },
      { id: "toast-2", message: "Toast 2", type: TOAST_TYPES.SUCCESS }
    );

    render(<ToastContainer />);

    fireEvent.click(screen.getByText(/dismiss all/i));

    expect(mockClearAll).toHaveBeenCalledTimes(1);
  });

  it("does not render dismiss all button for a single toast", () => {
    mockToasts.push({
      id: "toast-1",
      message: "Only toast",
      type: TOAST_TYPES.INFO,
    });

    render(<ToastContainer />);

    expect(screen.queryByText(/dismiss all/i)).not.toBeInTheDocument();
  });

  it("renders toast with role='status', aria-live='polite', and state inspection attributes", () => {
    mockToasts.push({
      id: "toast-1",
      message: "Accessible toast",
      type: TOAST_TYPES.SUCCESS,
    });

    render(<ToastContainer />);

    // There are now two role="status" elements: the toast itself (polite)
    // and the batch-dismiss screen reader announcement (assertive).
    // Filter by aria-live value to target the toast element.
    const statusElements = screen.getAllByRole("status");
    const toastStatus = statusElements.find((el) => el.getAttribute("aria-live") === "polite");
    expect(toastStatus).toBeInTheDocument();
    expect(toastStatus).toHaveAttribute("aria-live", "polite");
    expect(toastStatus).toHaveAttribute("data-toast-type", TOAST_TYPES.SUCCESS);
    expect(toastStatus).toHaveAttribute("data-is-alert", "false");
    expect(toastStatus).toHaveAttribute("data-state", "visible");
    expect(toastStatus).toHaveAttribute("data-progress", "100");
    expect(toastStatus).toHaveAttribute("data-reduced-motion", "false");
  });

  it("sets container state inspection attributes based on toast count", () => {
    mockToasts.push({
      id: "toast-1",
      message: "Counted toast",
      type: TOAST_TYPES.INFO,
    });

    render(<ToastContainer />);

    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("data-count", "1");
    expect(region).toHaveAttribute("data-has-toasts", "true");
    expect(region).toHaveAttribute("data-state", "visible");
    expect(region).toHaveAttribute("data-reduced-motion", "false");
  });

  it("keeps the container clear of the home-indicator gesture zone via safe-area padding", () => {
    mockToasts.push({
      id: "toast-1",
      message: "Safe area toast",
      type: TOAST_TYPES.INFO,
    });

    render(<ToastContainer />);

    const region = screen.getByRole("region");
    expect(region).toHaveClass("pb-[env(safe-area-inset-bottom)]");
  });

  it("renders different toast types correctly", () => {
    mockToasts.push(
      { id: "toast-1", message: "Success toast", type: TOAST_TYPES.SUCCESS },
      { id: "toast-2", message: "Error toast", type: TOAST_TYPES.ERROR },
      { id: "toast-3", message: "Warning toast", type: TOAST_TYPES.WARNING },
      { id: "toast-4", message: "Info toast", type: TOAST_TYPES.INFO }
    );

    render(<ToastContainer />);

    expect(screen.getByText("Success toast")).toBeInTheDocument();
    expect(screen.getByText("Error toast")).toBeInTheDocument();
    expect(screen.getByText("Warning toast")).toBeInTheDocument();
    expect(screen.getByText("Info toast")).toBeInTheDocument();
  });

  it("announces error toasts assertively with atomic live region", () => {
    mockToasts.push({
      id: "toast-err",
      message: "Something went wrong",
      type: TOAST_TYPES.ERROR,
    });

    render(<ToastContainer />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("aria-atomic", "true");
  });

  it("keeps a single accessible name when a custom ariaLabel is provided", () => {
    mockToasts.push({
      id: "toast-tip",
      message: "Pro tip body",
      type: TOAST_TYPES.INFO,
      ariaLabel: "Pro tip: keyboard shortcut",
    });

    const { container } = render(<ToastContainer />);

    const status = screen.getByRole("status", { name: "Pro tip: keyboard shortcut" });
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
    expect(container.querySelector('p[aria-label="Pro tip: keyboard shortcut"]')).toBeNull();
  });

  it("uses type=button on dismiss controls to avoid accidental form submits", () => {
    mockToasts.push({
      id: "toast-1",
      message: "Dismiss me",
      type: TOAST_TYPES.SUCCESS,
    });

    render(<ToastContainer />);

    const dismissButton = screen.getByRole("button", { name: /dismiss/i });
    expect(dismissButton).toHaveAttribute("type", "button");
  });

  it("dismisses the most recent toast on Escape when no modal is open", () => {
    mockToasts.push(
      { id: "toast-1", message: "Older toast", type: TOAST_TYPES.INFO },
      { id: "toast-2", message: "Newest toast", type: TOAST_TYPES.SUCCESS }
    );

    render(<ToastContainer />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockRemoveToast).toHaveBeenCalledTimes(1);
    expect(mockRemoveToast).toHaveBeenCalledWith("toast-2");
  });

  it("does not dismiss any toast on Escape while a modal dialog is open", () => {
    mockToasts.push({
      id: "toast-1",
      message: "Toast under modal",
      type: TOAST_TYPES.INFO,
    });

    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    document.body.appendChild(dialog);

    try {
      render(<ToastContainer />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockRemoveToast).not.toHaveBeenCalled();
      expect(mockClearAll).not.toHaveBeenCalled();
    } finally {
      dialog.remove();
    }
  });

  it("does not dismiss all toasts on Shift+Escape while a modal dialog is open", () => {
    mockToasts.push(
      { id: "toast-1", message: "Toast 1", type: TOAST_TYPES.INFO },
      { id: "toast-2", message: "Toast 2", type: TOAST_TYPES.SUCCESS }
    );

    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    document.body.appendChild(dialog);

    try {
      render(<ToastContainer />);

      fireEvent.keyDown(document, { key: "Escape", shiftKey: true });

      expect(mockClearAll).not.toHaveBeenCalled();
      expect(mockRemoveToast).not.toHaveBeenCalled();
    } finally {
      dialog.remove();
    }
  });

  it("ticks the countdown down in coarse steps under reduced motion", () => {
    vi.useFakeTimers();
    vi.mocked(useReducedMotion).mockReturnValue(true);

    const duration = 2000;
    mockToasts.push({
      id: "toast-1",
      message: "Reduced motion toast",
      type: TOAST_TYPES.INFO,
      duration,
    });

    render(<ToastContainer />);

    const toastStatus = screen
      .getAllByRole("status")
      .find((el) => el.getAttribute("aria-live") === "polite");
    expect(toastStatus).toHaveAttribute("data-progress", "100");
    expect(toastStatus).toHaveAttribute("data-reduced-motion", "true");

    act(() => {
      vi.advanceTimersByTime(TOAST_CONFIG.REDUCED_MOTION_PROGRESS_STEP_MS);
    });
    expect(toastStatus).toHaveAttribute(
      "data-progress",
      String(Math.round(100 * (1 - TOAST_CONFIG.REDUCED_MOTION_PROGRESS_STEP_MS / duration)))
    );

    act(() => {
      vi.advanceTimersByTime(TOAST_CONFIG.REDUCED_MOTION_PROGRESS_STEP_MS);
    });
    expect(toastStatus).toHaveAttribute(
      "data-progress",
      String(Math.round(100 * (1 - (2 * TOAST_CONFIG.REDUCED_MOTION_PROGRESS_STEP_MS) / duration)))
    );

    act(() => {
      vi.advanceTimersByTime(duration);
    });
    expect(toastStatus).toHaveAttribute("data-progress", "0");
  });
});
