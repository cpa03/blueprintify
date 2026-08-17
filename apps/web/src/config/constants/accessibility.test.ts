import { describe, it, expect } from "vitest";
import { CSS_CLASSES, ACCESSIBILITY_LABELS_SKIP } from "./accessibility";

describe("CSS_CLASSES — Iteration 185 additions", () => {
  it("defines SCROLL_SHADOW_TOP with the editor/wizard top overlay classes", () => {
    expect(CSS_CLASSES.SCROLL_SHADOW_TOP).toBe(
      "absolute top-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200"
    );
  });

  it("defines SCROLL_SHADOW_BOTTOM with the editor/wizard bottom overlay classes", () => {
    expect(CSS_CLASSES.SCROLL_SHADOW_BOTTOM).toBe(
      "absolute bottom-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200"
    );
  });

  it("defines KEYCAP for empty-state shortcut keycap styling", () => {
    expect(CSS_CLASSES.KEYCAP).toBe(
      "px-1.5 py-0.5 bg-dark-700 rounded text-2xs font-mono text-dark-300 border border-dark-600/50 leading-none"
    );
  });

  it("defines ICON_HOVER_ROTATE_90 for wizard step chevrons", () => {
    expect(CSS_CLASSES.ICON_HOVER_ROTATE_90).toBe(
      "w-4 h-4 transition-transform duration-200 motion-safe:group-hover:rotate-90"
    );
  });

  it("defines ICON_HOVER_ROTATE_8 for StepReview chevrons", () => {
    expect(CSS_CLASSES.ICON_HOVER_ROTATE_8).toBe(
      "w-4 h-4 transition-transform duration-200 motion-safe:group-hover:rotate-8"
    );
  });

  it("defines ICON_HOVER_SHIFT for wizard step arrow icons", () => {
    expect(CSS_CLASSES.ICON_HOVER_SHIFT).toBe(
      "w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
    );
  });
});

describe("ACCESSIBILITY_LABELS_SKIP", () => {
  it("defines the skip-to-main-content screen reader label", () => {
    expect(ACCESSIBILITY_LABELS_SKIP.SKIP_TO_MAIN_CONTENT).toBe("Skip to main content");
  });
});
