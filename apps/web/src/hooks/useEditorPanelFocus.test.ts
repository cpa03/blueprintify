/**
 * @fileoverview Tests for useEditorPanelFocus.
 *
 * Tests cover:
 * - Moves focus onto the editor panel when it opens and focus was lost to <body>
 * - Does not steal focus when the user is focused in another element
 * - Skips initial mount so a restored open panel never steals focus on load
 * - Does not move focus on close transitions
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEditorPanelFocus } from "./useEditorPanelFocus";
import { DOM_ELEMENT_IDS } from "../config/constants";

/** Flushes one animation frame so the hook's deferred focus() has run. */
async function flushAnimationFrame(): Promise<void> {
  await act(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

describe("useEditorPanelFocus", () => {
  let panel: HTMLDivElement;

  beforeEach(() => {
    panel = document.createElement("div");
    panel.id = DOM_ELEMENT_IDS.EDITOR_PANEL;
    panel.tabIndex = -1;
    document.body.appendChild(panel);
    document.body.focus();
  });

  afterEach(() => {
    panel.remove();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  it("focuses the panel when it opens and focus was lost to body", async () => {
    const { rerender } = renderHook(({ open }: { open: boolean }) => useEditorPanelFocus(open), {
      initialProps: { open: false },
    });

    expect(document.activeElement).toBe(document.body);

    rerender({ open: true });
    await flushAnimationFrame();

    expect(document.activeElement).toBe(panel);
  });

  it("does not steal focus when another element is focused", async () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    const { rerender } = renderHook(({ open }: { open: boolean }) => useEditorPanelFocus(open), {
      initialProps: { open: false },
    });

    rerender({ open: true });
    await flushAnimationFrame();

    expect(document.activeElement).toBe(input);
    input.remove();
  });

  it("skips initial mount when the panel starts open", async () => {
    renderHook(({ open }: { open: boolean }) => useEditorPanelFocus(open), {
      initialProps: { open: true },
    });
    await flushAnimationFrame();

    expect(document.activeElement).not.toBe(panel);
  });

  it("does not move focus on a close transition", async () => {
    const input = document.createElement("input");
    document.body.appendChild(input);

    const { rerender } = renderHook(({ open }: { open: boolean }) => useEditorPanelFocus(open), {
      initialProps: { open: false },
    });

    rerender({ open: true });
    await flushAnimationFrame();
    expect(document.activeElement).toBe(panel);

    input.focus();
    rerender({ open: false });
    await flushAnimationFrame();

    expect(document.activeElement).toBe(input);
    input.remove();
  });

  it("no-ops gracefully when the panel element is absent", async () => {
    panel.remove();

    const { rerender } = renderHook(({ open }: { open: boolean }) => useEditorPanelFocus(open), {
      initialProps: { open: false },
    });

    rerender({ open: true });
    await flushAnimationFrame();

    expect(document.getElementById(DOM_ELEMENT_IDS.EDITOR_PANEL)).toBeNull();
  });
});
