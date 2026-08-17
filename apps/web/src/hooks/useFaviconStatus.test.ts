import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFaviconStatus } from "./useFaviconStatus";
import { useEditorStore } from "../store";
import { FAVICON_CONFIG, GENERATION_MESSAGES } from "../config/constants";

describe("useFaviconStatus", () => {
  let existingLink: HTMLLinkElement | null = null;

  const setGeneration = (isGenerating: boolean, generationProgress: string): void => {
    act(() => {
      useEditorStore.setState({ isGenerating, generationProgress });
    });
  };

  beforeEach(() => {
    existingLink = document.createElement("link");
    existingLink.rel = "icon";
    existingLink.type = "image/svg+xml";
    existingLink.setAttribute("href", "/favicon.svg");
    document.head.appendChild(existingLink);
    setGeneration(false, "");
  });

  afterEach(() => {
    existingLink?.remove();
    document
      .querySelectorAll<HTMLLinkElement>(FAVICON_CONFIG.LINK_SELECTOR)
      .forEach((link) => link.remove());
    setGeneration(false, "");
    vi.restoreAllMocks();
  });

  const getIconLink = (): HTMLLinkElement | null =>
    document.querySelector<HTMLLinkElement>(FAVICON_CONFIG.LINK_SELECTOR);

  it("keeps the original favicon when idle", () => {
    renderHook(() => useFaviconStatus());

    expect(getIconLink()?.getAttribute("href")).toBe("/favicon.svg");
  });

  it("swaps to the loading favicon while generating", () => {
    renderHook(() => useFaviconStatus());

    setGeneration(true, "Generating blueprint...");

    expect(getIconLink()?.getAttribute("href")).toBe(FAVICON_CONFIG.LOADING_HREF);
  });

  it("keeps the loading favicon across streaming progress updates", () => {
    renderHook(() => useFaviconStatus());
    setGeneration(true, "Generating blueprint...");

    setGeneration(true, "42%");
    setGeneration(true, "73%");

    expect(getIconLink()?.getAttribute("href")).toBe(FAVICON_CONFIG.LOADING_HREF);
  });

  it("swaps to the complete favicon when generation finishes", () => {
    renderHook(() => useFaviconStatus());
    setGeneration(true, "Generating blueprint...");

    setGeneration(false, GENERATION_MESSAGES.COMPLETE);

    expect(getIconLink()?.getAttribute("href")).toBe(FAVICON_CONFIG.COMPLETE_HREF);
  });

  it("restores the original favicon when generation is cancelled", () => {
    renderHook(() => useFaviconStatus());
    setGeneration(true, "Generating blueprint...");

    setGeneration(false, GENERATION_MESSAGES.CANCELLED);

    expect(getIconLink()?.getAttribute("href")).toBe("/favicon.svg");
  });

  it("restores the original favicon on unmount while generating", () => {
    const { unmount } = renderHook(() => useFaviconStatus());
    setGeneration(true, "Generating blueprint...");
    expect(getIconLink()?.getAttribute("href")).toBe(FAVICON_CONFIG.LOADING_HREF);

    act(() => {
      unmount();
    });

    expect(getIconLink()?.getAttribute("href")).toBe("/favicon.svg");
  });

  it("walks the full lifecycle: generating -> complete -> idle", () => {
    renderHook(() => useFaviconStatus());

    setGeneration(true, "Generating blueprint...");
    expect(getIconLink()?.getAttribute("href")).toBe(FAVICON_CONFIG.LOADING_HREF);

    setGeneration(false, GENERATION_MESSAGES.COMPLETE);
    expect(getIconLink()?.getAttribute("href")).toBe(FAVICON_CONFIG.COMPLETE_HREF);

    setGeneration(false, "");
    expect(getIconLink()?.getAttribute("href")).toBe("/favicon.svg");
  });

  it("creates a favicon link when none exists and removes it on unmount", () => {
    existingLink?.remove();
    expect(getIconLink()).toBeNull();

    const { unmount } = renderHook(() => useFaviconStatus());
    expect(getIconLink()?.getAttribute("href")).toBe(FAVICON_CONFIG.DEFAULT_HREF);

    setGeneration(true, "Generating blueprint...");
    expect(getIconLink()?.getAttribute("href")).toBe(FAVICON_CONFIG.LOADING_HREF);

    act(() => {
      unmount();
    });
    expect(getIconLink()).toBeNull();
  });
});
