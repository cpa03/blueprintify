import { render } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { VercelAnalytics } from "./VercelAnalytics";

describe("VercelAnalytics", () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
    vi.clearAllMocks();
  });

  it("renders null on localhost", () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    const { container } = render(<VercelAnalytics />);
    expect(container.innerHTML).toBe("");
  });

  it("renders null on 127.0.0.1", () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "127.0.0.1" },
      writable: true,
    });
    const { container } = render(<VercelAnalytics />);
    expect(container.innerHTML).toBe("");
  });
});
