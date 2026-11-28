import { describe, it, expect } from "vitest";
import {
  CSS_CLASSES,
  ACCESSIBILITY_LABELS_SKIP,
  DOM_ELEMENT_IDS,
  DYNAMIC_ID_AFFIXES,
} from "./accessibility";

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

describe("CSS_CLASSES glow family — Iteration 223", () => {
  it("defines the 8 glow/attention class names with exact byte values", () => {
    expect(CSS_CLASSES.ATTENTION_GLOW).toBe("attention-glow");
    expect(CSS_CLASSES.GLOW_PULSE).toBe("glow-pulse");
    expect(CSS_CLASSES.CIRCULAR_COMPLETE_GLOW).toBe("circular-complete-glow");
    expect(CSS_CLASSES.GENERATE_PROGRESS_GLOW).toBe("generate-progress-glow");
    expect(CSS_CLASSES.CIRCULAR_COMPLETE_CELEBRATION).toBe("circular-complete-celebration");
    expect(CSS_CLASSES.AMBIENT_GLOW).toBe("ambient-glow");
    expect(CSS_CLASSES.SAVED_CELEBRATION_GLOW).toBe("saved-celebration-glow");
    expect(CSS_CLASSES.CARD_GLOW_HOVER).toBe("card-glow-hover");
  });

  it("keeps every glow class unique so multi-site families never drift into collisions", () => {
    const values = [
      CSS_CLASSES.ATTENTION_GLOW,
      CSS_CLASSES.GLOW_PULSE,
      CSS_CLASSES.CIRCULAR_COMPLETE_GLOW,
      CSS_CLASSES.GENERATE_PROGRESS_GLOW,
      CSS_CLASSES.CIRCULAR_COMPLETE_CELEBRATION,
      CSS_CLASSES.AMBIENT_GLOW,
      CSS_CLASSES.SAVED_CELEBRATION_GLOW,
      CSS_CLASSES.CARD_GLOW_HOVER,
    ];
    expect(values).toHaveLength(8);
    expect(new Set(values).size).toBe(8);
  });

  it("marks every glow class as a lowercase kebab-case class token", () => {
    const values = [
      CSS_CLASSES.ATTENTION_GLOW,
      CSS_CLASSES.GLOW_PULSE,
      CSS_CLASSES.CIRCULAR_COMPLETE_GLOW,
      CSS_CLASSES.GENERATE_PROGRESS_GLOW,
      CSS_CLASSES.CIRCULAR_COMPLETE_CELEBRATION,
      CSS_CLASSES.AMBIENT_GLOW,
      CSS_CLASSES.SAVED_CELEBRATION_GLOW,
      CSS_CLASSES.CARD_GLOW_HOVER,
    ];
    for (const value of values) {
      expect(value).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it("pins ATTENTION_GLOW byte-identity for the multi-site Header/PreviewEmptyState/StepGenerating family", () => {
    expect(` ${CSS_CLASSES.ATTENTION_GLOW}`).toBe(" attention-glow");
    expect(`btn-primary flex items-center gap-2 ${CSS_CLASSES.ATTENTION_GLOW}`).toBe(
      "btn-primary flex items-center gap-2 attention-glow"
    );
  });

  it("pins CIRCULAR_COMPLETE_* byte-identity to the index.css reduced-motion selector group", () => {
    expect(
      `.${CSS_CLASSES.GLOW_PULSE},\n    .${CSS_CLASSES.CIRCULAR_COMPLETE_GLOW},\n    .${CSS_CLASSES.CIRCULAR_COMPLETE_CELEBRATION},\n    .${CSS_CLASSES.GENERATE_PROGRESS_GLOW}`
    ).toBe(
      ".glow-pulse,\n    .circular-complete-glow,\n    .circular-complete-celebration,\n    .generate-progress-glow"
    );
  });
});

describe("CSS_CLASSES skeleton family — Iteration 224", () => {
  it("defines the 12 skeleton class names with exact byte values", () => {
    expect(CSS_CLASSES.SKELETON_BLOCK).toBe("skeleton-block");
    expect(CSS_CLASSES.SKELETON_BLOCK_STATIC).toBe("skeleton-block--static");
    expect(CSS_CLASSES.EDITOR_SKELETON).toBe("editor-skeleton");
    expect(CSS_CLASSES.EDITOR_SKELETON_GUTTER).toBe("editor-skeleton-gutter");
    expect(CSS_CLASSES.EDITOR_SKELETON_LINE_NUMBER).toBe("editor-skeleton-line-number");
    expect(CSS_CLASSES.EDITOR_SKELETON_CODE).toBe("editor-skeleton-code");
    expect(CSS_CLASSES.EDITOR_SKELETON_CODE_LINE).toBe("editor-skeleton-code-line");
    expect(CSS_CLASSES.PREVIEW_SKELETON).toBe("preview-skeleton");
    expect(CSS_CLASSES.PREVIEW_SKELETON_HEADING).toBe("preview-skeleton-heading");
    expect(CSS_CLASSES.PREVIEW_SKELETON_LINE).toBe("preview-skeleton-line");
    expect(CSS_CLASSES.PREVIEW_SKELETON_SUBHEADING).toBe("preview-skeleton-subheading");
    expect(CSS_CLASSES.PREVIEW_SKELETON_CODE_BLOCK).toBe("preview-skeleton-code-block");
  });

  it("keeps every skeleton class unique so multi-site families never drift into collisions", () => {
    const values = [
      CSS_CLASSES.SKELETON_BLOCK,
      CSS_CLASSES.SKELETON_BLOCK_STATIC,
      CSS_CLASSES.EDITOR_SKELETON,
      CSS_CLASSES.EDITOR_SKELETON_GUTTER,
      CSS_CLASSES.EDITOR_SKELETON_LINE_NUMBER,
      CSS_CLASSES.EDITOR_SKELETON_CODE,
      CSS_CLASSES.EDITOR_SKELETON_CODE_LINE,
      CSS_CLASSES.PREVIEW_SKELETON,
      CSS_CLASSES.PREVIEW_SKELETON_HEADING,
      CSS_CLASSES.PREVIEW_SKELETON_LINE,
      CSS_CLASSES.PREVIEW_SKELETON_SUBHEADING,
      CSS_CLASSES.PREVIEW_SKELETON_CODE_BLOCK,
    ];
    expect(values).toHaveLength(12);
    expect(new Set(values).size).toBe(12);
  });

  it("marks every skeleton class as a lowercase kebab-case class token", () => {
    const values = [
      CSS_CLASSES.SKELETON_BLOCK,
      CSS_CLASSES.SKELETON_BLOCK_STATIC,
      CSS_CLASSES.EDITOR_SKELETON,
      CSS_CLASSES.EDITOR_SKELETON_GUTTER,
      CSS_CLASSES.EDITOR_SKELETON_LINE_NUMBER,
      CSS_CLASSES.EDITOR_SKELETON_CODE,
      CSS_CLASSES.EDITOR_SKELETON_CODE_LINE,
      CSS_CLASSES.PREVIEW_SKELETON,
      CSS_CLASSES.PREVIEW_SKELETON_HEADING,
      CSS_CLASSES.PREVIEW_SKELETON_LINE,
      CSS_CLASSES.PREVIEW_SKELETON_SUBHEADING,
      CSS_CLASSES.PREVIEW_SKELETON_CODE_BLOCK,
    ];
    for (const value of values) {
      expect(value).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it("pins SKELETON_BLOCK byte-identity for the multi-site Editor/LazyCodeMirror/LazyMarkdownRenderer/App family", () => {
    expect(`${CSS_CLASSES.SKELETON_BLOCK}`).toBe("skeleton-block");
    expect(`${CSS_CLASSES.SKELETON_BLOCK} ${CSS_CLASSES.PREVIEW_SKELETON_HEADING}`).toBe(
      "skeleton-block preview-skeleton-heading"
    );
    expect(`${CSS_CLASSES.SKELETON_BLOCK} ${CSS_CLASSES.PREVIEW_SKELETON_LINE}`).toBe(
      "skeleton-block preview-skeleton-line"
    );
    expect(`${CSS_CLASSES.SKELETON_BLOCK} ${CSS_CLASSES.PREVIEW_SKELETON_SUBHEADING}`).toBe(
      "skeleton-block preview-skeleton-subheading"
    );
    expect(`${CSS_CLASSES.SKELETON_BLOCK} ${CSS_CLASSES.PREVIEW_SKELETON_CODE_BLOCK}`).toBe(
      "skeleton-block preview-skeleton-code-block"
    );
    expect(`${CSS_CLASSES.SKELETON_BLOCK} ${CSS_CLASSES.SKELETON_BLOCK_STATIC} h-5 w-36`).toBe(
      "skeleton-block skeleton-block--static h-5 w-36"
    );
  });

  it("pins EDITOR_SKELETON_* byte-identity to the index.css layout selector group", () => {
    expect(
      `.${CSS_CLASSES.EDITOR_SKELETON},\n  .${CSS_CLASSES.EDITOR_SKELETON_GUTTER},\n  .${CSS_CLASSES.EDITOR_SKELETON_LINE_NUMBER}`
    ).toBe(".editor-skeleton,\n  .editor-skeleton-gutter,\n  .editor-skeleton-line-number");
    expect(
      `.${CSS_CLASSES.EDITOR_SKELETON_CODE},\n  .${CSS_CLASSES.EDITOR_SKELETON_CODE_LINE}`
    ).toBe(".editor-skeleton-code,\n  .editor-skeleton-code-line");
  });

  it("pins PREVIEW_SKELETON_* byte-identity to the index.css preview selector group", () => {
    expect(
      `.${CSS_CLASSES.PREVIEW_SKELETON},\n  .${CSS_CLASSES.PREVIEW_SKELETON_HEADING},\n  .${CSS_CLASSES.PREVIEW_SKELETON_SUBHEADING}`
    ).toBe(".preview-skeleton,\n  .preview-skeleton-heading,\n  .preview-skeleton-subheading");
    expect(
      `.${CSS_CLASSES.PREVIEW_SKELETON_LINE},\n  .${CSS_CLASSES.PREVIEW_SKELETON_CODE_BLOCK}`
    ).toBe(".preview-skeleton-line,\n  .preview-skeleton-code-block");
  });

  it("pins SKELETON_BLOCK byte-identity to the index.css reduced-motion selector", () => {
    expect(`.${CSS_CLASSES.SKELETON_BLOCK} {\n    background:`).toBe(
      ".skeleton-block {\n    background:"
    );
    expect(`.${CSS_CLASSES.SKELETON_BLOCK}::after {\n    animation: none;`).toBe(
      ".skeleton-block::after {\n    animation: none;"
    );
    expect(`.${CSS_CLASSES.SKELETON_BLOCK_STATIC}::after {\n  animation: none;`).toBe(
      ".skeleton-block--static::after {\n  animation: none;"
    );
  });
});

describe("CSS_CLASSES animation/effect family — Iteration 225", () => {
  it("defines the 11 animation/effect class names with exact byte values", () => {
    expect(CSS_CLASSES.FORM_READY_PULSE).toBe("form-ready-pulse");
    expect(CSS_CLASSES.STACK_CARD_ATTENTION).toBe("stack-card-attention");
    expect(CSS_CLASSES.PROGRESS_SHIMMER).toBe("progress-shimmer");
    expect(CSS_CLASSES.STEP_ACTIVATE).toBe("step-activate");
    expect(CSS_CLASSES.STEP_COMPLETE_FLASH).toBe("step-complete-flash");
    expect(CSS_CLASSES.STEP_COUNT_POP).toBe("step-count-pop");
    expect(CSS_CLASSES.CONNECTOR_FLASH).toBe("connector-flash");
    expect(CSS_CLASSES.COUNTER_CELEBRATE_POP).toBe("counter-celebrate-pop");
    expect(CSS_CLASSES.CONTENT_DOT_BREATHE).toBe("motion-safe:content-dot-breathe");
    expect(CSS_CLASSES.INVALID_FIELD_FLASH).toBe("invalid-field-flash");
    expect(CSS_CLASSES.TECH_CHIP).toBe("tech-chip");
  });

  it("keeps every animation/effect class unique so multi-site families never drift into collisions", () => {
    const values = [
      CSS_CLASSES.FORM_READY_PULSE,
      CSS_CLASSES.STACK_CARD_ATTENTION,
      CSS_CLASSES.PROGRESS_SHIMMER,
      CSS_CLASSES.STEP_ACTIVATE,
      CSS_CLASSES.STEP_COMPLETE_FLASH,
      CSS_CLASSES.STEP_COUNT_POP,
      CSS_CLASSES.CONNECTOR_FLASH,
      CSS_CLASSES.COUNTER_CELEBRATE_POP,
      CSS_CLASSES.CONTENT_DOT_BREATHE,
      CSS_CLASSES.INVALID_FIELD_FLASH,
      CSS_CLASSES.TECH_CHIP,
    ];
    expect(values).toHaveLength(11);
    expect(new Set(values).size).toBe(11);
  });

  it("marks every animation/effect class as a lowercase class token (optional motion-safe: variant prefix)", () => {
    const values = [
      CSS_CLASSES.FORM_READY_PULSE,
      CSS_CLASSES.STACK_CARD_ATTENTION,
      CSS_CLASSES.PROGRESS_SHIMMER,
      CSS_CLASSES.STEP_ACTIVATE,
      CSS_CLASSES.STEP_COMPLETE_FLASH,
      CSS_CLASSES.STEP_COUNT_POP,
      CSS_CLASSES.CONNECTOR_FLASH,
      CSS_CLASSES.COUNTER_CELEBRATE_POP,
      CSS_CLASSES.CONTENT_DOT_BREATHE,
      CSS_CLASSES.INVALID_FIELD_FLASH,
      CSS_CLASSES.TECH_CHIP,
    ];
    for (const value of values) {
      expect(value).toMatch(/^(?:motion-safe:)?[a-z][a-z0-9-]*$/);
    }
  });

  it("pins PROGRESS_SHIMMER byte-identity for the multi-site StepInfo/StepStack/StepGenerating family", () => {
    expect(
      `h-full bg-gradient-to-r from-primary-500 to-accent-emerald ${
        CSS_CLASSES.PROGRESS_SHIMMER
      } relative`
    ).toBe("h-full bg-gradient-to-r from-primary-500 to-accent-emerald progress-shimmer relative");
    expect(
      `bg-gradient-to-r from-accent-emerald to-primary-500 ${CSS_CLASSES.PROGRESS_SHIMMER} relative`
    ).toBe("bg-gradient-to-r from-accent-emerald to-primary-500 progress-shimmer relative");
    expect(
      `h-full rounded-full bg-gradient-to-r from-primary-500 via-accent-purple to-accent-pink ${
        CSS_CLASSES.PROGRESS_SHIMMER
      } relative`
    ).toBe(
      "h-full rounded-full bg-gradient-to-r from-primary-500 via-accent-purple to-accent-pink progress-shimmer relative"
    );
    expect(`${CSS_CLASSES.PROGRESS_SHIMMER}::after`).toBe("progress-shimmer::after");
  });

  it("pins INVALID_FIELD_FLASH / TECH_CHIP / remaining ternary byte-identity for their multi-site families", () => {
    expect(`relative ${CSS_CLASSES.INVALID_FIELD_FLASH} rounded-xl`).toBe(
      "relative invalid-field-flash rounded-xl"
    );
    expect(`${CSS_CLASSES.TECH_CHIP} relative overflow-hidden animate-fade-in`).toBe(
      "tech-chip relative overflow-hidden animate-fade-in"
    );
    expect(`${CSS_CLASSES.TECH_CHIP} relative overflow-hidden hover:border-accent-emerald/50`).toBe(
      "tech-chip relative overflow-hidden hover:border-accent-emerald/50"
    );
    expect(`@keyframes ${CSS_CLASSES.STACK_CARD_ATTENTION} {`).toBe(
      "@keyframes stack-card-attention {"
    );
    expect(`${CSS_CLASSES.STACK_CARD_ATTENTION}`).toBe("stack-card-attention");
    expect(`${CSS_CLASSES.FORM_READY_PULSE}`).toBe("form-ready-pulse");
    expect(`text-xs font-semibold ${CSS_CLASSES.STEP_COUNT_POP}`).toBe(
      "text-xs font-semibold step-count-pop"
    );
    expect(`${CSS_CLASSES.COUNTER_CELEBRATE_POP}`).toBe("counter-celebrate-pop");
    expect(`${CSS_CLASSES.STEP_ACTIVATE}`).toBe("step-activate");
    expect(`${CSS_CLASSES.STEP_COMPLETE_FLASH}`).toBe("step-complete-flash");
    expect(`${CSS_CLASSES.CONNECTOR_FLASH}`).toBe("connector-flash");
  });

  it("pins CONTENT_DOT_BREATHE bare-token byte-identity to the index.css .content-dot-breathe selector", () => {
    const variantPrefix = "motion-safe:";
    expect(CSS_CLASSES.CONTENT_DOT_BREATHE.startsWith(variantPrefix)).toBe(true);
    expect(`.${CSS_CLASSES.CONTENT_DOT_BREATHE.slice(variantPrefix.length)}`).toBe(
      ".content-dot-breathe"
    );
    expect(
      `.${CSS_CLASSES.CONTENT_DOT_BREATHE.slice(variantPrefix.length)} {\n    animation:`
    ).toBe(".content-dot-breathe {\n    animation:");
  });

  it("pins the family byte-identity to the index.css base + reduced-motion selector groups", () => {
    expect(
      `.${CSS_CLASSES.STACK_CARD_ATTENTION},\n    .${CSS_CLASSES.PROGRESS_SHIMMER}::after,`
    ).toBe(".stack-card-attention,\n    .progress-shimmer::after,");
    expect(`    .${CSS_CLASSES.STEP_ACTIVATE},\n    .animate-step-pulse,`).toBe(
      "    .step-activate,\n    .animate-step-pulse,"
    );
    expect(`.${CSS_CLASSES.STEP_COUNT_POP},\n    .${CSS_CLASSES.CONNECTOR_FLASH},`).toBe(
      ".step-count-pop,\n    .connector-flash,"
    );
    expect(
      `.${CSS_CLASSES.COUNTER_CELEBRATE_POP},\n    .animate-compact-counter-pop,\n    .${CSS_CLASSES.CONTENT_DOT_BREATHE.slice(
        "motion-safe:".length
      )},\n    .arrival-pop,\n    .${CSS_CLASSES.FORM_READY_PULSE},`
    ).toBe(
      ".counter-celebrate-pop,\n    .animate-compact-counter-pop,\n    .content-dot-breathe,\n    .arrival-pop,\n    .form-ready-pulse,"
    );
    expect(`.${CSS_CLASSES.STEP_COMPLETE_FLASH},\n    .${CSS_CLASSES.INVALID_FIELD_FLASH},`).toBe(
      ".step-complete-flash,\n    .invalid-field-flash,"
    );
    expect(`.${CSS_CLASSES.TECH_CHIP}.selected {`).toBe(".tech-chip.selected {");
    expect(`.${CSS_CLASSES.STACK_CARD_ATTENTION} {\n    animation:`).toBe(
      ".stack-card-attention {\n    animation:"
    );
  });
});

describe("ACCESSIBILITY_LABELS_SKIP", () => {
  it("defines the skip-to-main-content screen reader label", () => {
    expect(ACCESSIBILITY_LABELS_SKIP.SKIP_TO_MAIN_CONTENT).toBe("Skip to main content");
  });
});

describe("DOM_ELEMENT_IDS — Iterations 197 + 211", () => {
  it("defines all 27 ARIA-relationship DOM element IDs", () => {
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
    expect(DOM_ELEMENT_IDS.FEATURE_INPUT_COUNTER).toBe("feature-input-counter");
    expect(DOM_ELEMENT_IDS.ADDED_FEATURES_LABEL).toBe("added-features-label");
    expect(DOM_ELEMENT_IDS.SUGGESTIONS_LABEL).toBe("suggestions-label");
    expect(DOM_ELEMENT_IDS.SELECTED_TECH_LABEL).toBe("selected-tech-label");
  });

  it("defines the 14 StepInfo/feature form-field IDs (Iteration 211 + counter descriptions)", () => {
    expect(DOM_ELEMENT_IDS.STEP_INFO_PROJECT_NAME).toBe("projectName");
    expect(DOM_ELEMENT_IDS.STEP_INFO_PROJECT_NAME_COUNTER).toBe("projectName-counter");
    expect(DOM_ELEMENT_IDS.STEP_INFO_PROJECT_NAME_WARNING).toBe("projectName-warning");
    expect(DOM_ELEMENT_IDS.STEP_INFO_PROJECT_NAME_ERROR).toBe("projectName-error");
    expect(DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION).toBe("description");
    expect(DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION_COUNTER).toBe("description-counter");
    expect(DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION_HINT).toBe("description-hint");
    expect(DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION_WARNING).toBe("description-warning");
    expect(DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION_ERROR).toBe("description-error");
    expect(DOM_ELEMENT_IDS.STEP_INFO_TARGET_AUDIENCE).toBe("targetAudience");
    expect(DOM_ELEMENT_IDS.STEP_INFO_TARGET_AUDIENCE_COUNTER).toBe("targetAudience-counter");
    expect(DOM_ELEMENT_IDS.STEP_INFO_CONSTRAINTS).toBe("constraints");
    expect(DOM_ELEMENT_IDS.STEP_INFO_CONSTRAINTS_COUNTER).toBe("constraints-counter");
  });

  it("keeps every element ID unique so ARIA references never collide", () => {
    const values = Object.values(DOM_ELEMENT_IDS);
    expect(values).toHaveLength(27);
    expect(new Set(values).size).toBe(27);
  });
});

describe("DYNAMIC_ID_AFFIXES — Iteration 221", () => {
  it("defines the 4 dynamic ID affixes with exact byte values", () => {
    expect(DYNAMIC_ID_AFFIXES.TAB_PREFIX).toBe("tab-");
    expect(DYNAMIC_ID_AFFIXES.CATEGORY_PREFIX).toBe("category-");
    expect(DYNAMIC_ID_AFFIXES.LOCKED_HINT_SUFFIX).toBe("-locked-hint");
    expect(DYNAMIC_ID_AFFIXES.PANEL_SUFFIX).toBe("-panel");
  });

  it("keeps every affix unique so composed IDs never collide", () => {
    const values = Object.values(DYNAMIC_ID_AFFIXES);
    expect(values).toHaveLength(4);
    expect(new Set(values).size).toBe(4);
  });

  it("marks TAB_PREFIX and CATEGORY_PREFIX as prefixes and the other two as suffixes", () => {
    expect(DYNAMIC_ID_AFFIXES.TAB_PREFIX.endsWith("-")).toBe(true);
    expect(DYNAMIC_ID_AFFIXES.CATEGORY_PREFIX.endsWith("-")).toBe(true);
    expect(DYNAMIC_ID_AFFIXES.LOCKED_HINT_SUFFIX.startsWith("-")).toBe(true);
    expect(DYNAMIC_ID_AFFIXES.PANEL_SUFFIX.startsWith("-")).toBe(true);
    expect(DYNAMIC_ID_AFFIXES.TAB_PREFIX.startsWith("-")).toBe(false);
    expect(DYNAMIC_ID_AFFIXES.CATEGORY_PREFIX.startsWith("-")).toBe(false);
    expect(DYNAMIC_ID_AFFIXES.LOCKED_HINT_SUFFIX.endsWith("-")).toBe(false);
    expect(DYNAMIC_ID_AFFIXES.PANEL_SUFFIX.endsWith("-")).toBe(false);
  });

  it("composes byte-identical IDs with the historical bare literals", () => {
    expect(`${DYNAMIC_ID_AFFIXES.TAB_PREFIX}blueprint`).toBe("tab-blueprint");
    expect(`${DYNAMIC_ID_AFFIXES.TAB_PREFIX}tasks`).toBe("tab-tasks");
    expect(`info${DYNAMIC_ID_AFFIXES.LOCKED_HINT_SUFFIX}`).toBe("info-locked-hint");
    expect(`frontend${DYNAMIC_ID_AFFIXES.PANEL_SUFFIX}`).toBe("frontend-panel");
    expect(`${DYNAMIC_ID_AFFIXES.CATEGORY_PREFIX}frontend`).toBe("category-frontend");
    expect(`blueprint${DYNAMIC_ID_AFFIXES.PANEL_SUFFIX}`).toBe("blueprint-panel");
    expect(`tasks${DYNAMIC_ID_AFFIXES.PANEL_SUFFIX}`).toBe("tasks-panel");
  });

  it("keeps PANEL_SUFFIX byte-identical to the StepGenerating [id$=] selector fragment", () => {
    expect(`[id$="${DYNAMIC_ID_AFFIXES.PANEL_SUFFIX}"]`).toBe('[id$="-panel"]');
  });
});
