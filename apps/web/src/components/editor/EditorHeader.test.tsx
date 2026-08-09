/**
 * Tests for EditorHeader (split-pane editor header)
 *
 * Issue #1014 — this component previously had no real tests (only a vi.mock
 * stub inside Editor.test.tsx). Covers:
 * - Tab rendering and active state (aria-selected)
 * - Tab switching via click and arrow-key navigation
 * - Content stats (chars / words / lines / reading time)
 * - EditorToolbar prop passing
 * - Last saved indicator visibility
 */

import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { EditorHeader } from "./EditorHeader";
import { EditorToolbar } from "./EditorToolbar";
import { EDITOR_TABS, EDITOR_FILENAMES } from "@blueprint/shared/config";
import { EDITOR_LABELS } from "../../config/constants";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";

// Mock framer-motion to render plain HTML elements
vi.mock("framer-motion", () => ({
  motion: {
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  },
  AnimatePresence: vi.fn(({ children }) => <>{children}</>),
}));

vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  span: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
}));

// Mock child components
vi.mock("../SmartTooltip", () => ({
  KeyboardShortcutTooltip: vi.fn(
    ({ children, shortcut: _s, description: _d, position: _p, modifier: _m }) => <>{children}</>
  ),
}));

vi.mock("../Icon", () => ({
  Icon: vi.fn(({ name, className }: { name: string; className?: string }) => (
    <span data-testid={`icon-${name}`} className={className}>
      {name}
    </span>
  )),
}));

vi.mock("../LastSavedIndicator", () => ({
  LastSavedIndicator: vi.fn(({ text, isVisible }: { text?: string; isVisible?: boolean }) => (
    <span data-testid="last-saved" data-visible={isVisible}>
      {text}
    </span>
  )),
}));

vi.mock("./EditorToolbar", () => ({
  EditorToolbar: vi.fn(() => <div data-testid="editor-toolbar" />),
}));

const defaultProps = {
  activeTab: EDITOR_TABS.BLUEPRINT,
  setActiveTab: vi.fn(),
  viewMode: "split" as const,
  setViewMode: vi.fn(),
  onCopy: vi.fn(),
  onExport: vi.fn(),
  onNew: vi.fn(),
  hasContent: true,
  copied: null,
};

describe("EditorHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ======== Tab Rendering ========

  it("renders both document tabs", () => {
    render(<EditorHeader {...defaultProps} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(screen.getByText(EDITOR_FILENAMES.BLUEPRINT)).toBeInTheDocument();
    expect(screen.getByText(EDITOR_FILENAMES.TASKS)).toBeInTheDocument();
  });

  it("marks the active tab as selected", () => {
    render(<EditorHeader {...defaultProps} activeTab={EDITOR_TABS.TASKS} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false"); // blueprint
    expect(tabs[1]).toHaveAttribute("aria-selected", "true"); // tasks
  });

  it("switches tabs when a tab button is clicked", () => {
    render(<EditorHeader {...defaultProps} />);
    fireEvent.click(screen.getByText(EDITOR_FILENAMES.TASKS));
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith(EDITOR_TABS.TASKS);
  });

  // ======== Keyboard Navigation ========

  it("moves to the next tab on ArrowRight and focuses it", () => {
    render(<EditorHeader {...defaultProps} />);
    const tablist = screen.getByRole("tablist");
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith(EDITOR_TABS.TASKS);
    expect(document.getElementById(`tab-${EDITOR_TABS.TASKS}`)).toHaveFocus();
  });

  it("wraps to the first tab on ArrowRight from the last tab", () => {
    render(<EditorHeader {...defaultProps} activeTab={EDITOR_TABS.TASKS} />);
    const tablist = screen.getByRole("tablist");
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith(EDITOR_TABS.BLUEPRINT);
  });

  it("moves to the previous tab on ArrowLeft", () => {
    render(<EditorHeader {...defaultProps} activeTab={EDITOR_TABS.TASKS} />);
    const tablist = screen.getByRole("tablist");
    fireEvent.keyDown(tablist, { key: "ArrowLeft" });
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith(EDITOR_TABS.BLUEPRINT);
  });

  it("jumps to the first tab on Home", () => {
    render(<EditorHeader {...defaultProps} activeTab={EDITOR_TABS.TASKS} />);
    const tablist = screen.getByRole("tablist");
    fireEvent.keyDown(tablist, { key: "Home" });
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith(EDITOR_TABS.BLUEPRINT);
  });

  it("jumps to the last tab on End", () => {
    render(<EditorHeader {...defaultProps} />);
    const tablist = screen.getByRole("tablist");
    fireEvent.keyDown(tablist, { key: "End" });
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith(EDITOR_TABS.TASKS);
  });

  it("ignores unrelated keys in the tablist", () => {
    render(<EditorHeader {...defaultProps} />);
    const tablist = screen.getByRole("tablist");
    fireEvent.keyDown(tablist, { key: "a" });
    expect(defaultProps.setActiveTab).not.toHaveBeenCalled();
  });

  // ======== Content Stats ========

  it("renders content stats when content is provided", () => {
    render(<EditorHeader {...defaultProps} content="hello world\nsecond line" />);
    expect(screen.getByText(EDITOR_LABELS.CONTENT_STATS.CHARS)).toBeInTheDocument();
    expect(screen.getByText(EDITOR_LABELS.CONTENT_STATS.WORDS)).toBeInTheDocument();
    expect(screen.getByText(EDITOR_LABELS.CONTENT_STATS.LINES)).toBeInTheDocument();
    expect(screen.getByText(EDITOR_LABELS.CONTENT_STATS.READING_TIME)).toBeInTheDocument();
  });

  it("does not render content stats when content is empty", () => {
    render(<EditorHeader {...defaultProps} content="" />);
    expect(screen.queryByText(EDITOR_LABELS.CONTENT_STATS.CHARS)).not.toBeInTheDocument();
  });

  it("shows a '<1 min' reading time for short content", () => {
    render(<EditorHeader {...defaultProps} content="short" />);
    expect(screen.getByText(EDITOR_LABELS.CONTENT_STATS.LESS_THAN_ONE_MIN)).toBeInTheDocument();
  });

  // ======== Toolbar & Status ========

  it("passes editor state to the toolbar", () => {
    render(<EditorHeader {...defaultProps} hasContent={false} isExporting={true} />);
    const toolbarCalls = (EditorToolbar as unknown as Mock).mock.calls;
    expect(toolbarCalls).toHaveLength(1);
    expect(toolbarCalls[0]?.[0]).toEqual(
      expect.objectContaining({
        activeTab: EDITOR_TABS.BLUEPRINT,
        viewMode: "split",
        hasContent: false,
        isExporting: true,
      })
    );
  });

  it("shows the last saved indicator when content and text are present", () => {
    render(<EditorHeader {...defaultProps} lastSavedText="Saved 2 min ago" hasChanges={false} />);
    expect(screen.getByTestId("last-saved")).toHaveAttribute("data-visible", "true");
    expect(screen.getByTestId("last-saved")).toHaveTextContent("Saved 2 min ago");
  });

  it("hides the last saved indicator when there is no content", () => {
    render(
      <EditorHeader
        {...defaultProps}
        hasContent={false}
        lastSavedText="Saved 2 min ago"
        hasChanges={false}
      />
    );
    expect(screen.getByTestId("last-saved")).toHaveAttribute("data-visible", "false");
  });

  // ======== Content Availability Live Region ========

  it("renders a status live region on inactive tabs when sibling content is available", () => {
    render(<EditorHeader {...defaultProps} tasksHasContent={true} />);
    const tasksTab = screen.getByRole("tab", { name: new RegExp(EDITOR_FILENAMES.TASKS) });
    const status = within(tasksTab).getByRole("status");
    expect(status).toHaveAttribute(
      "aria-label",
      ACCESSIBILITY_LABELS.EDITOR.CONTENT_AVAILABLE(EDITOR_FILENAMES.TASKS_DISPLAY)
    );
  });

  it("does not render a content-available live region when sibling content is absent", () => {
    const { container } = render(<EditorHeader {...defaultProps} />);
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument();
  });

  it("does not show a content-available dot on the active tab", () => {
    render(<EditorHeader {...defaultProps} blueprintHasContent={true} />);
    const blueprintTab = screen.getByRole("tab", { name: new RegExp(EDITOR_FILENAMES.BLUEPRINT) });
    expect(within(blueprintTab).queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces streaming content via a status live region while generating", () => {
    const { container } = render(<EditorHeader {...defaultProps} isGenerating={true} />);
    const streamStatus = container.querySelector('[role="status"]');
    expect(streamStatus).toHaveAttribute(
      "aria-label",
      ACCESSIBILITY_LABELS.EDITOR.STREAMING_CONTENT
    );
  });
});
