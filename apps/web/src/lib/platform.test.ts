/**
 * @fileoverview Tests for platform detection and keyboard shortcut
 * formatting utilities in lib/platform.ts (issue #954).
 *
 * Covers:
 * - isMacOS: true on macOS navigator.platform, false elsewhere and SSR-safe
 * - getModifierLabel / getAltKeyLabel: platform-specific key labels
 * - formatShortcut: modifier-group formatting ("⌘ + K" / "Ctrl + K")
 * - getAriaShortcutKey: WAI-ARIA aria-keyshortcuts values ("Meta+e")
 */

import { describe, expect, it, vi, afterEach } from "vitest";
import {
  isMacOS,
  getModifierLabel,
  getAltKeyLabel,
  formatShortcut,
  getAriaShortcutKey,
} from "./platform";

function stubPlatform(platform: string) {
  Object.defineProperty(globalThis.navigator, "platform", {
    writable: true,
    value: platform,
  });
}

describe("isMacOS", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns false on non-macOS platforms", () => {
    stubPlatform("Linux x86_64");
    expect(isMacOS()).toBe(false);
  });

  it("returns true when navigator.platform contains MAC", () => {
    stubPlatform("MacIntel");
    expect(isMacOS()).toBe(true);
  });

  it("is SSR-safe and returns false when navigator is undefined", () => {
    vi.stubGlobal("navigator", undefined);
    expect(isMacOS()).toBe(false);
  });
});

describe("getModifierLabel / getAltKeyLabel", () => {
  const originalPlatform = globalThis.navigator.platform;

  afterEach(() => {
    stubPlatform(originalPlatform);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns Ctrl on non-macOS platforms", () => {
    stubPlatform("Linux x86_64");
    expect(getModifierLabel()).toBe("Ctrl");
    expect(getAltKeyLabel()).toBe("Alt");
  });

  it("returns ⌘ and ⌥ on macOS", () => {
    stubPlatform("MacIntel");
    expect(getModifierLabel()).toBe("\u2318");
    expect(getAltKeyLabel()).toBe("\u2325");
  });
});

describe("formatShortcut", () => {
  const originalMac = globalThis.navigator.platform;

  afterEach(() => {
    stubPlatform(originalMac);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses Ctrl modifier on non-macOS platforms by default", () => {
    stubPlatform("Linux x86_64");
    expect(formatShortcut("k")).toBe("Ctrl + K");
  });

  it("uses the ⌘ modifier on macOS by default", () => {
    stubPlatform("MacIntel");
    expect(formatShortcut("k")).toBe("\u2318 + K");
  });

  it("uses Alt modifier label when modifier is alt", () => {
    stubPlatform("Linux x86_64");
    expect(formatShortcut("k", "alt")).toBe("Alt + K");
    stubPlatform("MacIntel");
    expect(formatShortcut("k", "alt")).toBe("\u2325 + K");
  });

  it("always uses Ctrl when modifier is ctrl", () => {
    stubPlatform("MacIntel");
    expect(formatShortcut("k", "ctrl")).toBe("Ctrl + K");
  });

  it("returns the raw shortcut when modifier is none", () => {
    stubPlatform("Linux x86_64");
    expect(formatShortcut("Home", "none")).toBe("Home");
  });

  it("uppercases the shortcut key", () => {
    stubPlatform("Linux x86_64");
    expect(formatShortcut("escape")).toBe("Ctrl + ESCAPE");
  });
});

describe("getAriaShortcutKey", () => {
  const originalMac = globalThis.navigator.platform;

  afterEach(() => {
    stubPlatform(originalMac);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns the raw key when modifier is default (none)", () => {
    expect(getAriaShortcutKey("Escape")).toBe("Escape");
    expect(getAriaShortcutKey("?")).toBe("?");
  });

  it("uses Control on non-macOS platforms for cmd modifier", () => {
    stubPlatform("Linux x86_64");
    expect(getAriaShortcutKey("e", "cmd")).toBe("Control+e");
  });

  it("uses Meta on macOS for cmd modifier", () => {
    stubPlatform("MacIntel");
    expect(getAriaShortcutKey("e", "cmd")).toBe("Meta+e");
  });

  it("always uses Control for ctrl modifier", () => {
    stubPlatform("MacIntel");
    expect(getAriaShortcutKey("1", "ctrl")).toBe("Control+1");
  });

  it("always uses Alt for alt modifier", () => {
    stubPlatform("MacIntel");
    expect(getAriaShortcutKey("x", "alt")).toBe("Alt+x");
  });
});
