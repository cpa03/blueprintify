import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HeadingAnchor } from "./HeadingAnchor";

vi.mock("../lib/export", () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
}));

vi.mock("../utils/slug", () => ({
  generateSlug: vi.fn((text: string) => text.toLowerCase().replace(/\s+/g, "-")),
}));

vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

import { copyToClipboard } from "../lib/export";

describe("HeadingAnchor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children", () => {
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    expect(screen.getByText("Installation")).toBeInTheDocument();
  });

  it("renders children with inline elements", () => {
    render(
      <HeadingAnchor headingText="API Reference">
        <code>API</code> Reference
      </HeadingAnchor>
    );
    expect(screen.getByText("Reference")).toBeInTheDocument();
  });

  it("renders anchor button with initial opacity 0", () => {
    render(<HeadingAnchor headingText="Getting Started">Getting Started</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle("opacity: 0");
  });

  it("copies link to clipboard when clicked", async () => {
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");
    await act(async () => {
      fireEvent.click(button);
    });
    const expectedUrl = `${window.location.origin}${window.location.pathname}#installation`;
    expect(copyToClipboard).toHaveBeenCalledWith(expectedUrl);
  });

  it("shows copied confirmation after clicking", async () => {
    vi.useFakeTimers();
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");
    await act(async () => {
      fireEvent.click(button);
    });
    expect(screen.getByText("Copied!")).toBeInTheDocument();
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
  });

  it("generates slug from heading text", async () => {
    render(<HeadingAnchor headingText="Getting Started">Getting Started</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");
    await act(async () => {
      fireEvent.click(button);
    });
    const expectedUrl = `${window.location.origin}${window.location.pathname}#getting-started`;
    expect(copyToClipboard).toHaveBeenCalledWith(expectedUrl);
  });
});
