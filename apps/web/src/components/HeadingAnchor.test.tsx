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
import { useReducedMotion } from "../hooks/useReducedMotion";
import { BANNER_STATE_VALUES, COPY_STATE_VALUES } from "@blueprint/shared/config";

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

  it("renders anchor button with initial opacity 0 and state data attributes", () => {
    render(<HeadingAnchor headingText="Getting Started">Getting Started</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle("opacity: 0");
    expect(button).toHaveAttribute("data-state", BANNER_STATE_VALUES.HIDDEN);
    expect(button).toHaveAttribute("data-copied-state", COPY_STATE_VALUES.IDLE);
    expect(button).toHaveAttribute("data-slug", "getting-started");
  });

  it("keeps the anchor button keyboard-reachable before it is visible", () => {
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");
    expect(button).toHaveAttribute("tabindex", "0");
    expect(button).not.toHaveAttribute("aria-hidden");
  });

  it("reveals the anchor button when it receives keyboard focus", () => {
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");
    expect(button).toHaveAttribute("data-state", BANNER_STATE_VALUES.HIDDEN);

    fireEvent.focus(button);

    expect(button).toHaveAttribute("data-state", BANNER_STATE_VALUES.VISIBLE);
  });

  it("hides the anchor button again after focus leaves", () => {
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");

    fireEvent.focus(button);
    expect(button).toHaveAttribute("data-state", BANNER_STATE_VALUES.VISIBLE);

    fireEvent.blur(button);
    expect(button).toHaveAttribute("data-state", BANNER_STATE_VALUES.HIDDEN);
  });

  it("copies the link when activated via keyboard", async () => {
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");

    fireEvent.focus(button);
    await act(async () => {
      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.click(button);
    });

    const expectedUrl = `${window.location.origin}${window.location.pathname}#installation`;
    expect(copyToClipboard).toHaveBeenCalledWith(expectedUrl);
  });

  it("updates data-copied-state and data-state when clicked", async () => {
    vi.useFakeTimers();
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");
    expect(button).toHaveAttribute("data-copied-state", COPY_STATE_VALUES.IDLE);

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAttribute("data-copied-state", COPY_STATE_VALUES.COPIED);
    expect(button).toHaveAttribute("data-state", BANNER_STATE_VALUES.VISIBLE);

    act(() => {
      vi.runAllTimers();
    });

    expect(button).toHaveAttribute("data-copied-state", COPY_STATE_VALUES.IDLE);
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

  it("swaps aria-label and title to the copied state after a successful copy", async () => {
    vi.useFakeTimers();
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByRole("button", { name: 'Copy link to "Installation" section' });
    expect(button).toHaveAttribute("title", "Copy anchor link");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAccessibleName("Link copied to clipboard");
    expect(button).toHaveAttribute("title", "Copied!");
  });

  it("restores the idle aria-label and title after the copied state expires", async () => {
    vi.useFakeTimers();
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByRole("button", { name: 'Copy link to "Installation" section' });

    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAccessibleName("Link copied to clipboard");

    act(() => {
      vi.runAllTimers();
    });

    expect(button).toHaveAccessibleName('Copy link to "Installation" section');
    expect(button).toHaveAttribute("title", "Copy anchor link");
  });

  it("keeps the idle accessible name when the copy fails", async () => {
    vi.mocked(copyToClipboard).mockResolvedValueOnce(false);
    vi.useFakeTimers();
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByRole("button", { name: 'Copy link to "Installation" section' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAccessibleName('Copy link to "Installation" section');
    expect(button).toHaveAttribute("title", "Copy anchor link");
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

  it("creates particle burst on successful copy", async () => {
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");

    await act(async () => {
      fireEvent.click(button);
    });

    const particles = document.querySelectorAll(".absolute.rounded-full.pointer-events-none");
    expect(particles.length).toBeGreaterThan(0);
  });

  it("does not create particles when reduced motion is preferred", async () => {
    vi.mocked(useReducedMotion).mockReturnValueOnce(true);

    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");

    await act(async () => {
      fireEvent.click(button);
    });

    const particles = document.querySelectorAll(".absolute.rounded-full.pointer-events-none");
    expect(particles.length).toBe(0);
  });

  it("mounts a persistent empty live region before any interaction", () => {
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    expect(liveRegion).toBeEmptyDOMElement();
  });

  it("announces a successful copy through the persistent live region", async () => {
    vi.useFakeTimers();
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByRole("status")).toHaveTextContent("Anchor link copied to clipboard");

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("announces a failed copy through the persistent live region", async () => {
    vi.mocked(copyToClipboard).mockResolvedValueOnce(false);
    vi.useFakeTimers();
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByRole("status")).toHaveTextContent("Failed to copy anchor link to clipboard");
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("keeps a single live region across repeated copy cycles", async () => {
    vi.useFakeTimers();
    render(<HeadingAnchor headingText="Installation">Installation</HeadingAnchor>);
    const button = screen.getByTitle("Copy anchor link");

    await act(async () => {
      fireEvent.click(button);
    });
    act(() => {
      vi.runAllTimers();
    });
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Anchor link copied to clipboard");
  });
});
