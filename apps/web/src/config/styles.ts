/**
 * Shared Tailwind CSS class constants
 * Flexy says: No hardcoded class strings - everything modular!
 *
 * Centralizes all repeated class patterns to eliminate duplication
 * and ensure consistent styling across components.
 */

// ============================================================================
// Focus visible ring pattern - used across interactive elements
// ============================================================================
export const FOCUS_VISIBLE_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 rounded px-1";

export const FOCUS_VISIBLE_RING_CARD =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950";

// ============================================================================
// SVG icon sizing - consistent icon dimensions
// ============================================================================
export const ICON = {
  SM: "w-3.5 h-3.5",
  MD: "w-4 h-4",
  LG: "w-5 h-5",
  XL: "w-6 h-6",
  /** Icon stroke width for SVG paths */
  STROKE: {
    THIN: 2,
    NORMAL: 2.5,
    BOLD: 3,
  },
} as const;

// ============================================================================
// Spinner animation - loading indicators
// ============================================================================
export const SPINNER = {
  DEFAULT: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500",
  SM: "animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full",
  /** Spinner for template loading overlay */
  OVERLAY: "w-8 h-8 border-2 border-accent-emerald/30 border-t-accent-emerald rounded-full",
} as const;

// ============================================================================
// Layout classes - page structure
// ============================================================================
export const LAYOUT = {
  PAGE_WRAPPER: "min-h-screen flex flex-col",
  MAIN_CONTENT: "flex-1 pt-20 scroll-mt-20",
  CONTENT_CONTAINER: "max-w-7xl mx-auto px-4 sm:px-6 py-8",
  HERO_SECTION: "text-center mb-12",
  HERO_TITLE: "text-4xl sm:text-5xl font-bold text-white mb-4",
  HERO_SUBTITLE: "text-lg text-dark-400 max-w-2xl mx-auto",
  SPLIT_PANE: "flex flex-col lg:flex-row gap-6 min-h-150",
  /** Glass card with overflow hidden */
  GLASS_CARD: "glass-card overflow-hidden relative",
  /** Glass card with width transition */
  GLASS_CARD_FLEX: "glass-card overflow-hidden transition-[width,transform,opacity] duration-300",
  FULL_WIDTH: "w-full",
  HALF_WIDTH: "w-full lg:w-1/2",
  TEMPLATES_DIVIDER: "text-center text-dark-500 my-8",
  FOOTER: "border-t border-dark-800 py-6 transition-colors duration-200",
  FOOTER_CONTAINER:
    "max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-dark-500",
} as const;

// ============================================================================
// Markdown content classes
// ============================================================================
export const MARKDOWN = {
  /** Code block header bar */
  CODE_HEADER:
    "absolute top-0 right-0 left-0 flex items-center justify-between px-3 py-2 bg-dark-800/90 backdrop-blur-sm rounded-t-lg border-b border-dark-700/50",
  /** Code block language label */
  CODE_LANGUAGE: "text-xs text-dark-400 font-mono uppercase tracking-wide",
  /** Copy button base (covers all states) */
  COPY_BUTTON_BASE:
    "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50",
  COPY_BUTTON_COPIED: "bg-accent-emerald/20 text-accent-emerald",
  COPY_BUTTON_HOVER: "bg-primary-500/20 text-dark-300",
  COPY_BUTTON_IDLE: "bg-dark-700/50 text-dark-400",
  /** Inline code */
  INLINE_CODE: "bg-dark-800 px-1.5 py-0.5 rounded text-sm font-mono text-primary-400",
  /** Code block wrapper */
  CODE_WRAPPER: "relative my-4 group",
  /** Syntax highlighter override */
  SYNTAX_HIGHLIGHTER: "!mt-0 !rounded-t-none !rounded-lg overflow-x-auto pt-12",
  /** Blockquote */
  BLOCKQUOTE:
    "border-l-4 border-purple-500 pl-4 py-2 my-4 bg-dark-800/50 rounded-r-md italic text-dark-300",
  /** Table container */
  TABLE_CONTAINER: "overflow-x-auto my-4",
  /** Table */
  TABLE: "min-w-full border-collapse border border-dark-700 rounded-lg overflow-hidden",
  /** Table head */
  TABLE_HEAD: "bg-dark-800",
  /** Table header cell */
  TABLE_TH: "border border-dark-700 px-4 py-3 text-left font-semibold text-white",
  /** Table cell */
  TABLE_TD: "border border-dark-700 px-4 py-3 text-dark-300",
  /** Table row */
  TABLE_TR: "hover:bg-dark-800/50 transition-colors",
  /** Headings */
  H1: "text-3xl font-bold text-white mb-4 mt-6 pb-2 border-b border-dark-700",
  H2: "text-2xl font-bold text-white mb-3 mt-6",
  H3: "text-xl font-semibold text-white mb-2 mt-5",
  H4: "text-lg font-semibold text-white mb-2 mt-4",
  H5: "text-base font-semibold text-white mb-2 mt-4",
  H6: "text-sm font-semibold text-white mb-2 mt-4",
  /** Paragraph */
  PARAGRAPH: "text-dark-300 mb-4 leading-relaxed",
  /** Unordered list */
  UL: "list-disc list-inside mb-4 text-dark-300 space-y-2",
  /** Ordered list */
  OL: "list-decimal list-inside mb-4 text-dark-300 space-y-2",
  /** List item */
  LI: "leading-relaxed",
  /** Anchor / link */
  LINK: "text-primary-400 hover:text-purple-400 transition-colors underline decoration-2 underline-offset-2",
  /** Image */
  IMAGE: "max-w-full h-auto rounded-lg shadow-lg my-4",
  /** Horizontal rule */
  HR: "border-t border-dark-700 my-8",
  /** Content wrapper */
  CONTENT_WRAPPER: "markdown-content",
} as const;

// ============================================================================
// Form element classes
// ============================================================================
export const FORM = {
  /** Section heading */
  SECTION_TITLE: "text-xl font-semibold text-white mb-2",
  SECTION_SUBTITLE: "text-dark-400 mb-6",
} as const;

// ============================================================================
// Typing indicator classes
// ============================================================================
export const TYPING = {
  DOT: "w-1.5 h-1.5 rounded-full bg-primary-400",
  SR_ONLY: "sr-only",
} as const;

// ============================================================================
// Button and interaction classes
// ============================================================================
export const BUTTON = {
  /** Fixed bottom-right show editor button — positioned above ScrollToTop (bottom-6) to prevent overlap */
  SHOW_EDITOR_FAB: "fixed bottom-24 right-6 btn-primary shadow-2xl",
  /** Hide editor button (desktop) */
  HIDE_EDITOR_DESKTOP: "hidden lg:flex absolute top-4 right-4 z-10 btn-ghost",
  /** Hide editor button (mobile) */
  HIDE_EDITOR_MOBILE:
    "lg:hidden absolute top-4 right-4 z-10 btn-ghost bg-dark-800/90 backdrop-blur-sm",
} as const;
