/**
 * @fileoverview Tests for PreviewEmptyState component
 *
 * Tests cover the empty state display logic:
 * - Rendering for blueprint and tasks tabs
 * - Generating state with loading indicator
 * - Sibling tab content detection and switch button
 * - Navigation hint display
 * - Accessibility attributes
 */
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PreviewEmptyState } from "./PreviewEmptyState";
import { EDITOR_TABS } from "../config/constants";

// Mock framer-motion to render children without animations.
// PreviewEmptyState uses `import * as motion from "framer-motion/m"` (namespace import),
// so the mock must provide named exports (not a default export) for each used element.
vi.mock("framer-motion/m", () => ({
  div: vi.fn(({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  )),
  span: vi.fn(({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <span {...props}>{children}</span>
  )),
  button: vi.fn(
    ({
      children,
      whileHover: _wh,
      whileTap: _wt,
      ...props
    }: {
      children?: ReactNode;
      whileHover?: unknown;
      whileTap?: unknown;
      [key: string]: unknown;
    }) => <button {...props}>{children}</button>
  ),
  p: vi.fn(({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <p {...props}>{children}</p>
  )),
  h3: vi.fn(({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <h3 {...props}>{children}</h3>
  )),
  path: vi.fn(({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <path {...props}>{children}</path>
  )),
}));

// The component also imports AnimatePresence from "framer-motion"
vi.mock("framer-motion", () => ({
  AnimatePresence: vi.fn(({ children }: { children?: ReactNode }) => <>{children}</>),
}));

describe("PreviewEmptyState", () => {
  it("renders blueprint empty state with correct title and filename", () => {
    render(<PreviewEmptyState tab={EDITOR_TABS.BLUEPRINT} />);
    expect(screen.getByText("Blueprint not yet generated")).toBeInTheDocument();
    expect(screen.getByText("blueprint.md")).toBeInTheDocument();
  });

  it("renders tasks empty state with correct title and filename", () => {
    render(<PreviewEmptyState tab={EDITOR_TABS.TASKS} />);
    expect(screen.getByText("Tasks not yet generated")).toBeInTheDocument();
    expect(screen.getByText("task.md")).toBeInTheDocument();
  });

  it("shows generating content message for blueprint when isGenerating is true", () => {
    render(<PreviewEmptyState tab={EDITOR_TABS.BLUEPRINT} isGenerating={true} />);
    expect(screen.getByText(/Content is being generated/i)).toBeInTheDocument();
  });

  it("shows generating content message for tasks when isGenerating is true", () => {
    render(<PreviewEmptyState tab={EDITOR_TABS.TASKS} isGenerating={true} />);
    expect(screen.getByText(/Blueprint generation in progress/i)).toBeInTheDocument();
  });

  it("shows switch tab button when sibling has content and not generating", () => {
    render(
      <PreviewEmptyState
        tab={EDITOR_TABS.BLUEPRINT}
        siblingTabHasContent={true}
        onSwitchTab={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /switch to tasks tab/i })).toBeInTheDocument();
  });

  it("calls onSwitchTab when switch button is clicked", () => {
    const onSwitchTab = vi.fn();
    render(
      <PreviewEmptyState
        tab={EDITOR_TABS.BLUEPRINT}
        siblingTabHasContent={true}
        onSwitchTab={onSwitchTab}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /switch to tasks tab/i }));
    expect(onSwitchTab).toHaveBeenCalledTimes(1);
  });

  it("does not show switch button when isGenerating even if sibling has content", () => {
    render(
      <PreviewEmptyState
        tab={EDITOR_TABS.BLUEPRINT}
        isGenerating={true}
        siblingTabHasContent={true}
        onSwitchTab={vi.fn()}
      />
    );
    expect(screen.queryByRole("button", { name: /switch to tasks tab/i })).not.toBeInTheDocument();
  });

  it("shows wizard completion hint when no sibling content and not generating", () => {
    render(<PreviewEmptyState tab={EDITOR_TABS.BLUEPRINT} siblingTabHasContent={false} />);
    expect(screen.getByText(/complete the wizard/i)).toBeInTheDocument();
  });

  it("renders with correct heading for blueprint tab", () => {
    render(<PreviewEmptyState tab={EDITOR_TABS.BLUEPRINT} />);
    expect(
      screen.getByRole("heading", { name: /blueprint not yet generated/i })
    ).toBeInTheDocument();
  });

  it("renders switch tab button with correct label for tasks tab", () => {
    const onSwitchTab = vi.fn();
    render(
      <PreviewEmptyState
        tab={EDITOR_TABS.TASKS}
        siblingTabHasContent={true}
        onSwitchTab={onSwitchTab}
      />
    );
    expect(screen.getByRole("button", { name: /switch to blueprint tab/i })).toBeInTheDocument();
  });

  it("renders correct filenames for each tab", () => {
    const { rerender } = render(<PreviewEmptyState tab={EDITOR_TABS.BLUEPRINT} />);
    expect(screen.getByText("blueprint.md")).toBeInTheDocument();

    rerender(<PreviewEmptyState tab={EDITOR_TABS.TASKS} />);
    expect(screen.getByText("task.md")).toBeInTheDocument();
  });
});
