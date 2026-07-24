import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditorToolbar, type ViewMode } from "./EditorToolbar";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Proxy framer-motion to actual implementations (strips animation props)
vi.mock("framer-motion", async (importOriginal) => {
  const Actual = (await importOriginal()) as Record<string, unknown>;
  const ActualMotion = Actual.motion as Record<string, unknown> | undefined;
  return {
    ...Actual,
    motion: new Proxy(
      {},
      {
        get: (_target, prop) => {
          const c = prop as string;
          if (ActualMotion && typeof ActualMotion[c] === "function") return ActualMotion[c];
          return ActualMotion?.div;
        },
      }
    ),
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("framer-motion/m", async () => {
  const { createElement, forwardRef } = await import("react");
  const mkMotion = (tag: string) =>
    forwardRef<HTMLElement, Record<string, unknown>>(
      (
        {
          whileHover: _w1,
          whileTap: _w2,
          animate: _a,
          initial: _i,
          exit: _e,
          layoutId: _l,
          transition: _t,
          style: _s,
          ...props
        },
        ref
      ) => createElement(tag, { ...props, ref })
    );
  return {
    default: {},
    div: mkMotion("div"),
    span: mkMotion("span"),
    button: mkMotion("button"),
    svg: mkMotion("svg"),
    path: mkMotion("path"),
    circle: mkMotion("circle"),
  };
});

vi.mock("../SmartTooltip", () => ({
  SmartTooltip: vi.fn(({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  )),
}));

vi.mock("../Icon", () => ({
  Icon: vi.fn(({ name, className }: { name: string; className?: string }) => (
    <span data-testid={`icon-${name}`} className={className}>
      {name}
    </span>
  )),
}));

vi.mock("../AnimatedCopyButton", () => ({
  AnimatedCopyButton: vi.fn(
    ({
      onCopy,
      isCopied,
      hasContent,
    }: {
      onCopy: () => void;
      isCopied: boolean;
      hasContent: boolean;
    }) => (
      <button
        data-testid="copy-button"
        onClick={onCopy}
        data-copied={isCopied}
        data-has-content={hasContent}
      >
        {isCopied ? "Copied!" : "Copy"}
      </button>
    )
  ),
}));

vi.mock("../../lib/platform", () => ({
  getAriaShortcutKey: vi.fn((key: string, modifier: string) => `${modifier}+${key}`),
  getModifierLabel: vi.fn(() => "⌘"),
  isMacOS: vi.fn(() => true),
}));

vi.mock("../../config/constants", () => ({
  SPRING_CONFIG: {
    SNAPPY: { stiffness: 300, damping: 20 },
    CHECKMARK: { stiffness: 500, damping: 15 },
  },
  EDITOR_LABELS: {
    VIEW_MODES: {
      EDIT: "Edit",
      SPLIT: "Split",
      PREVIEW: "Preview",
      GENERATING: "Generating...",
      EXPORTED: "Exported!",
    },
    VIEW_MODE_SHORTCUTS: { EDIT: "Ctrl/Cmd+1", SPLIT: "Ctrl/Cmd+2", PREVIEW: "Ctrl/Cmd+3" },
    VIEW_MODES_ARIA_LABEL: "Editor view mode",
    BUTTONS: {
      EXPORT_ZIP: "Export .zip",
      EXPORT_ARIA_LABEL: "Export as ZIP",
      EXPORT_SUCCESS_ARIA: "Export successful",
    },
  },
  ANIMATION: { GENTLE_PULSE: 1, SPINNER_ROTATION: 1, NORMAL: 0.2, CHECKMARK_REVEAL: 0.3 },
  EASING: { linear: "linear", easeInOut: "easeInOut" },
  ROTATION: { HALF: { rotate: 180 } },
  VIEW_MODE_SHORTCUT_KEYS: { edit: "1", split: "2", preview: "3" },
  VIEW_MODE_MODIFIER: "cmd",
  OPACITY_PULSE: { HALF_BLINK: 0.5 },
  KEYBOARD_SHORTCUTS: { NEW_PROJECT: { KEY: "N" } },
  ACCESSIBILITY_LABELS: {
    EDITOR: {
      START_NEW_PROJECT: "Start new project",
      VIEW_MODE: (label: string, shortcut: string) => `${label} view (${shortcut})`,
    },
  },
  TOOLTIP_LABELS: {
    EDITOR: {
      COPIED: "Copied!",
      COPY_TO_CLIPBOARD: "Copy to clipboard",
      EXPORTED: "Exported!",
      EXPORT_AS_ZIP: "Export as ZIP",
      START_NEW_PROJECT: "Start new project",
    },
  },
  SHORTCUT_LABELS: { COPY: "⌘C", EXPORT: "⌘E" },
  TOOLTIP_DEFAULTS: { SHOW_DELAY_MS: 500 },
  ANIMATION_ENTRANCE_DELAYS: { VERY_FAST: 0.05, FAST: 0.1 },
  VIEW_MODE_INDICATOR_POSITION: {
    EDIT_LEFT: 0,
    SPLIT_LEFT: 100,
    PREVIEW_LEFT: 200,
    SINGLE_WIDTH: 80,
    SPLIT_WIDTH: 100,
  },
  FRAMER_TYPE: { SPRING: "spring" },
  KEYBOARD_EVENT_KEYS: {
    ARROW_RIGHT: "ArrowRight",
    ARROW_LEFT: "ArrowLeft",
    HOME: "Home",
    END: "End",
  },
  MODIFIER_KEYS: { CMD: "cmd" },
}));

vi.mock("../../config/theme", () => ({
  COLORS: { primary: { 500: "#6366f1" }, accent: { violet: "#8b5cf6", emerald: "#10b981" } },
  EDITOR_ANIMATION: { VIEW_MODE_INDICATOR: { stiffness: 300, damping: 30 } },
  Z_INDEX: { base: 1 },
}));

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderToolbar(props: Partial<Parameters<typeof EditorToolbar>[0]> = {}) {
  return render(
    <EditorToolbar
      activeTab="blueprint"
      viewMode="split"
      setViewMode={vi.fn()}
      onCopy={vi.fn()}
      onExport={vi.fn()}
      onNew={vi.fn()}
      hasContent={true}
      copied={null}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EditorToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("View Mode Buttons", () => {
    it("renders all three view mode buttons", () => {
      renderToolbar();
      expect(screen.getByRole("radio", { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /preview/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /split/i })).toBeInTheDocument();
    });

    it("marks the active view mode as checked", () => {
      renderToolbar({ viewMode: "preview" });
      expect(screen.getByRole("radio", { name: /preview/i })).toHaveAttribute(
        "aria-checked",
        "true"
      );
      expect(screen.getByRole("radio", { name: /edit/i })).toHaveAttribute("aria-checked", "false");
    });

    it("calls setViewMode when clicked", () => {
      const setViewMode = vi.fn();
      renderToolbar({ setViewMode, viewMode: "edit" });
      fireEvent.click(screen.getByRole("radio", { name: /preview/i }));
      expect(setViewMode).toHaveBeenCalledWith("preview");
    });

    it("has radiogroup role", () => {
      renderToolbar();
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("moves to next mode on ArrowRight", () => {
      const setViewMode = vi.fn();
      renderToolbar({ setViewMode, viewMode: "edit" });
      fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
      expect(setViewMode).toHaveBeenCalledWith("split");
    });

    it("moves to previous mode on ArrowLeft", () => {
      const setViewMode = vi.fn();
      renderToolbar({ setViewMode, viewMode: "split" });
      fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowLeft" });
      expect(setViewMode).toHaveBeenCalledWith("edit");
    });

    it("wraps last to first on ArrowRight", () => {
      const setViewMode = vi.fn();
      renderToolbar({ setViewMode, viewMode: "preview" });
      fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
      expect(setViewMode).toHaveBeenCalledWith("edit");
    });

    it("wraps first to last on ArrowLeft", () => {
      const setViewMode = vi.fn();
      renderToolbar({ setViewMode, viewMode: "edit" });
      fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowLeft" });
      expect(setViewMode).toHaveBeenCalledWith("preview");
    });

    it("goes to first mode on Home", () => {
      const setViewMode = vi.fn();
      renderToolbar({ setViewMode, viewMode: "preview" });
      fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "Home" });
      expect(setViewMode).toHaveBeenCalledWith("edit");
    });

    it("goes to last mode on End", () => {
      const setViewMode = vi.fn();
      renderToolbar({ setViewMode, viewMode: "edit" });
      fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "End" });
      expect(setViewMode).toHaveBeenCalledWith("preview");
    });
  });

  describe("Copy Button", () => {
    it("renders and calls onCopy", () => {
      const onCopy = vi.fn();
      renderToolbar({ onCopy });
      fireEvent.click(screen.getByTestId("copy-button"));
      expect(onCopy).toHaveBeenCalledOnce();
    });

    it("shows copied state when copied matches activeTab", () => {
      renderToolbar({ copied: "blueprint", activeTab: "blueprint" });
      expect(screen.getByTestId("copy-button")).toHaveAttribute("data-copied", "true");
    });

    it("shows non-copied state otherwise", () => {
      renderToolbar({ copied: "tasks", activeTab: "blueprint" });
      expect(screen.getByTestId("copy-button")).toHaveAttribute("data-copied", "false");
    });
  });

  describe("Export Button", () => {
    it("renders and calls onExport", () => {
      const onExport = vi.fn();
      renderToolbar({ onExport });
      fireEvent.click(screen.getByRole("button", { name: /export/i }));
      expect(onExport).toHaveBeenCalledOnce();
    });

    it("disables when hasContent is false", () => {
      renderToolbar({ hasContent: false });
      expect(screen.getByRole("button", { name: /export/i })).toBeDisabled();
    });

    it("disables when isExporting", () => {
      renderToolbar({ isExporting: true });
      expect(screen.getByRole("button", { name: /export/i })).toBeDisabled();
    });

    it("enables when hasContent and not exporting", () => {
      renderToolbar({ hasContent: true, isExporting: false });
      expect(screen.getByRole("button", { name: /export/i })).toBeEnabled();
    });
  });

  describe("New Project Button", () => {
    it("renders and calls onNew", () => {
      const onNew = vi.fn();
      renderToolbar({ onNew });
      fireEvent.click(screen.getByText("New"));
      expect(onNew).toHaveBeenCalledOnce();
    });

    it("has aria-keyshortcuts attribute", () => {
      renderToolbar();
      expect(screen.getByLabelText("Start new project")).toHaveAttribute("aria-keyshortcuts");
    });
  });

  describe("Accessibility", () => {
    it("has aria-label on radiogroup", () => {
      renderToolbar();
      expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-label");
    });

    it("renders New button with accessible label", () => {
      renderToolbar();
      expect(screen.getByLabelText("Start new project")).toBeInTheDocument();
    });
  });
});
