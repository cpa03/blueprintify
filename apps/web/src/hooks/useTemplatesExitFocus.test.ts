/**
 * @fileoverview Tests for useTemplatesExitFocus.
 *
 * Tests cover:
 * - Focuses the first focusable control inside the panel when the template
 *   block leaves and focus was dropped to <body>
 * - Falls back to the panel container itself while the wizard is still loading
 * - Does not steal focus when another element is focused
 * - Skips initial mount so a page that loads with the block hidden never
 *   steals focus
 * - Ignores the hidden → visible transition
 * - No-ops gracefully when the panel ref was never attached
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTemplatesExitFocus } from "./useTemplatesExitFocus";

/** Flushes one animation frame so the hook's deferred focus() has run. */
async function flushAnimationFrame(): Promise<void> {
  await act(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

describe("useTemplatesExitFocus", () => {
  let panel: HTMLDivElement;
  let button: HTMLButtonElement;
  let panelRef: { current: HTMLElement | null };

  beforeEach(() => {
    panel = document.createElement("div");
    panel.tabIndex = -1;
    button = document.createElement("button");
    button.type = "button";
    panel.appendChild(button);
    document.body.appendChild(panel);
    panelRef = { current: panel };
    document.body.focus();
  });

  afterEach(() => {
    panel.remove();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  it("focuses the first focusable control when templates exit and focus was lost to body", async () => {
    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useTemplatesExitFocus(active, panelRef),
      { initialProps: { active: true } }
    );

    expect(document.activeElement).toBe(document.body);

    rerender({ active: false });
    await flushAnimationFrame();

    expect(document.activeElement).toBe(button);
  });

  it("falls back to the panel container when no focusable control is mounted yet", async () => {
    panel.removeChild(button);

    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useTemplatesExitFocus(active, panelRef),
      { initialProps: { active: true } }
    );

    rerender({ active: false });
    await flushAnimationFrame();

    expect(document.activeElement).toBe(panel);
  });

  it("does not steal focus when another element is focused", async () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useTemplatesExitFocus(active, panelRef),
      { initialProps: { active: true } }
    );

    rerender({ active: false });
    await flushAnimationFrame();

    expect(document.activeElement).toBe(input);
    input.remove();
  });

  it("skips initial mount when the block already starts hidden", async () => {
    renderHook(({ active }: { active: boolean }) => useTemplatesExitFocus(active, panelRef), {
      initialProps: { active: false },
    });
    await flushAnimationFrame();

    expect(document.activeElement).toBe(document.body);
  });

  it("does not move focus on the hidden → visible transition", async () => {
    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useTemplatesExitFocus(active, panelRef),
      { initialProps: { active: false } }
    );

    rerender({ active: true });
    await flushAnimationFrame();

    expect(document.activeElement).toBe(document.body);
  });

  it("no-ops gracefully when the panel ref was never attached", async () => {
    panelRef.current = null;

    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useTemplatesExitFocus(active, panelRef),
      { initialProps: { active: true } }
    );

    rerender({ active: false });
    await flushAnimationFrame();

    expect(document.activeElement).toBe(document.body);
  });
});
