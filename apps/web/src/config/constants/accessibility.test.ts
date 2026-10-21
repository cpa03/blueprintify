import { describe, it, expect } from "vitest";
import { CSS_CLASSES, ACCESSIBILITY_LABELS_SKIP, DOM_ELEMENT_IDS } from "./accessibility";

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
      "w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
    );
  });

  it("defines SR_ONLY for screen-reader-only live regions", () => {
    expect(CSS_CLASSES.SR_ONLY).toBe("sr-only");
  });
});

describe("ACCESSIBILITY_LABELS_SKIP", () => {
  it("defines the skip-to-main-content screen reader label", () => {
    expect(ACCESSIBILITY_LABELS_SKIP.SKIP_TO_MAIN_CONTENT).toBe("Skip to main content");
  });
});

describe("DOM_ELEMENT_IDS — Iteration 197", () => {
  it("defines all 13 ARIA-relationship DOM element IDs", () => {
    expect(DOM_ELEMENT_IDS.MAIN_CONTENT).toBe("main-content");
    expect(DOM_ELEMENT_IDS.EDITOR_PANEL).toBe("editor-panel");
    expect(DOM_ELEMENT_IDS.CONFIRM_DIALOG_TITLE).toBe("confirm-dialog-title");
    expect(DOM_ELEMENT_IDS.CONFIRM_DIALOG_DESCRIPTION).toBe("confirm-dialog-description");
    expect(DOM_ELEMENT_IDS.HEADER_BRAND_SCROLL_HINT).toBe("header-brand-scroll-hint");
    expect(DOM_ELEMENT_IDS.KEYBOARD_SHORTCUTS_TITLE).toBe("keyboard-shortcuts-title");
    expect(DOM_ELEMENT_IDS.KEYBOARD_SHORTCUTS_TIP).toBe("keyboard-shortcuts-tip");
    expect(DOM_ELEMENT_IDS.OFFLINE_BANNER_DESC).toBe("offline-banner-desc");
    expect(DOM_ELEMENT_IDS.FEATURE_INPUT).toBe("feature-input");
    expect(DOM_ELEMENT_IDS.FEATURE_INPUT_HINT).toBe("feature-input-hint");
    expect(DOM_ELEMENT_IDS.ADDED_FEATURES_LABEL).toBe("added-features-label");
    expect(DOM_ELEMENT_IDS.SUGGESTIONS_LABEL).toBe("suggestions-label");
    expect(DOM_ELEMENT_IDS.SELECTED_TECH_LABEL).toBe("selected-tech-label");
  });

  it("keeps every element ID unique so ARIA references never collide", () => {
    const values = Object.values(DOM_ELEMENT_IDS);
    expect(values).toHaveLength(13);
    expect(new Set(values).size).toBe(13);
  });
});
