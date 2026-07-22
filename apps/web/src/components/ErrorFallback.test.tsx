/**
 * @fileoverview Tests for ErrorFallback component.
 *
 * Covers: rendering with/without error details, copy error functionality,
 * reset/try-again action, reload action, and reduced-motion accessibility path.
 *
 * @module components/ErrorFallback.test
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorFallback } from "./ErrorFallback";
import { ERROR_BOUNDARY_TEXT, ACCESSIBILITY_LABELS } from "../config/constants/content";
import * as clipboard from "../lib/clipboard";

// ---------------------------------------------------------------------------
// Framer Motion mocks
// ---------------------------------------------------------------------------

vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    h1: vi.fn(({ children, ...props }) => <h1 {...props}>{children}</h1>),
    p: vi.fn(({ children, ...props }) => <p {...props}>{children}</p>),
    button: vi.fn(({ children, ...props }) => <button {...props}>{children}</button>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    svg: vi.fn(({ children, ...props }) => <svg {...props}>{children}</svg>),
    path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
    details: vi.fn(({ children, ...props }) => <details {...props}>{children}</details>),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  h1: vi.fn(({ children, ...props }) => <h1 {...props}>{children}</h1>),
  p: vi.fn(({ children, ...props }) => <p {...props}>{children}</p>),
  button: vi.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  svg: vi.fn(({ children, ...props }) => <svg {...props}>{children}</svg>),
  path: vi.fn(({ children, ...props }) => <path {...props}>{children}</path>),
  details: vi.fn(({ children, ...props }) => <details {...props}>{children}</details>),
}));

// ---------------------------------------------------------------------------
// Clipboard mock
// ---------------------------------------------------------------------------

vi.mock("../lib/clipboard", () => ({
  copyToClipboard: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("ErrorFallback", () => {
  const defaultError = new Error("Test error message");
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clipboard.copyToClipboard).mockResolvedValue(true);
  });

  // ---- Basic rendering ----

  it("renders the error title", () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    expect(screen.getByText(ERROR_BOUNDARY_TEXT.TITLE)).toBeInTheDocument();
  });

  it("renders the error description", () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    expect(screen.getByText(ERROR_BOUNDARY_TEXT.DESCRIPTION)).toBeInTheDocument();
  });

  it('sets role="alert" and aria-live="assertive" on the container', () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  // ---- Error message display ----

  it("displays the error message when error is an Error instance", () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByText(ERROR_BOUNDARY_TEXT.VIEW_DETAILS)).toBeInTheDocument();
  });

  it('displays "Unknown error" when error is not an Error instance', () => {
    render(<ErrorFallback error="string error" resetErrorBoundary={mockReset} />);
    expect(screen.getByText(ERROR_BOUNDARY_TEXT.UNKNOWN_ERROR)).toBeInTheDocument();
  });

  it("falls back to UNKNOWN_ERROR text when error is null", () => {
    render(<ErrorFallback error={null} resetErrorBoundary={mockReset} />);
    expect(screen.getByText(ERROR_BOUNDARY_TEXT.UNKNOWN_ERROR)).toBeInTheDocument();
  });

  it("uses empty error message when Error has no message", () => {
    render(<ErrorFallback error={new Error()} resetErrorBoundary={mockReset} />);
    // new Error() has .message === "", so the pre element should be empty
    const pre = document.querySelector("pre");
    expect(pre).toBeInTheDocument();
    expect(pre?.textContent).toBe("");
  });

  // ---- Copy error functionality ----

  it("renders the copy error button inside details", () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    expect(
      screen.getByLabelText(ACCESSIBILITY_LABELS.ERROR_BOUNDARY.COPY_ERROR)
    ).toBeInTheDocument();
  });

  it("copies error message to clipboard when copy button is clicked", async () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    const copyBtn = screen.getByLabelText(ACCESSIBILITY_LABELS.ERROR_BOUNDARY.COPY_ERROR);
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(clipboard.copyToClipboard).toHaveBeenCalledWith("Test error message");
    });
  });

  it('shows "Copied!" text after successful copy', async () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    const copyBtn = screen.getByLabelText(ACCESSIBILITY_LABELS.ERROR_BOUNDARY.COPY_ERROR);
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(screen.getByText(ERROR_BOUNDARY_TEXT.COPIED)).toBeInTheDocument();
    });
  });

  it("does not show copied state when copy fails", async () => {
    vi.mocked(clipboard.copyToClipboard).mockResolvedValue(false);
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    const copyBtn = screen.getByLabelText(ACCESSIBILITY_LABELS.ERROR_BOUNDARY.COPY_ERROR);
    fireEvent.click(copyBtn);

    // Wait for the async handler, then verify copy error label is still visible
    await waitFor(() => {
      expect(clipboard.copyToClipboard).toHaveBeenCalled();
    });

    expect(screen.getByText(ERROR_BOUNDARY_TEXT.COPY_ERROR)).toBeInTheDocument();
    expect(screen.queryByText(ERROR_BOUNDARY_TEXT.COPIED)).not.toBeInTheDocument();
  });

  // ---- Action buttons ----

  it("calls resetErrorBoundary when 'Try Again' button is clicked", () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    const tryAgainBtn = screen.getByLabelText(ACCESSIBILITY_LABELS.ERROR_BOUNDARY.TRY_AGAIN);
    fireEvent.click(tryAgainBtn);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("renders the reload button with correct aria label", () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    expect(
      screen.getByLabelText(ACCESSIBILITY_LABELS.ERROR_BOUNDARY.RELOAD_PAGE)
    ).toBeInTheDocument();
  });

  it("reloads the page when reload button is clicked", () => {
    const reloadMock = vi.fn();
    // Use stubGlobal to replace location.reload without triggering
    // jsdom teardown issues (delete + defineProperty pattern causes
    // "Cannot delete property 'location'" during vitest cleanup).
    vi.stubGlobal("location", {
      ...window.location,
      reload: reloadMock,
    });

    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    const reloadBtn = screen.getByLabelText(ACCESSIBILITY_LABELS.ERROR_BOUNDARY.RELOAD_PAGE);
    fireEvent.click(reloadBtn);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  // ---- Accessibility ----

  it("provides a screen reader status region for copy announcements", () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
    expect(statusRegion).toHaveAttribute("aria-atomic", "true");
  });

  it("updates screen reader text when error is copied", async () => {
    render(<ErrorFallback error={defaultError} resetErrorBoundary={mockReset} />);
    const copyBtn = screen.getByLabelText(ACCESSIBILITY_LABELS.ERROR_BOUNDARY.COPY_ERROR);
    fireEvent.click(copyBtn);

    await waitFor(() => {
      const statusRegion = screen.getByRole("status");
      expect(statusRegion.textContent).toBe(ACCESSIBILITY_LABELS.ERROR_BOUNDARY.ERROR_COPIED);
    });
  });

  // ---- Edge cases ----

  it("does not render error details when error is undefined", () => {
    // The component checks `error !== undefined` before rendering <details>
    render(<ErrorFallback error={undefined} resetErrorBoundary={mockReset} />);
    expect(screen.queryByText(ERROR_BOUNDARY_TEXT.VIEW_DETAILS)).not.toBeInTheDocument();
  });
});
