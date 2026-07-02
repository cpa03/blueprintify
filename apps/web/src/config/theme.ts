/**
 * Theme Configuration
 * Centralized design tokens for colors, animations, and visual properties
 * Flexy says: No hardcoded values - everything configurable!
 */

import { hexToRgba } from "@blueprint/shared";

// ============================================================================
// Color Palette
// ============================================================================

// ============================================================================
// Color Primitives — standalone values (extracted to break circular refs in gradients)
// ============================================================================
const _P500 = "#6366f1";
const _APURPLE = "#8b5cf6";
const _APINK = "#ec4899";

export const COLORS = {
  // Primary brand colors
  primary: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: _P500,
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
    950: "#1e1b4b",
  },

  // Dark theme palette
  dark: {
    50: "#f7f7f8",
    100: "#ececee",
    200: "#d5d5d9",
    300: "#b0b0b8",
    400: "#b8c0cc",
    500: "#9ca3af",
    600: "#5a5a62",
    700: "#4d4d53",
    800: "#434348",
    900: "#1a1a1e",
    950: "#0d0d0f",
  },

  // Accent colors
  accent: {
    cyan: "#06b6d4",
    purple: _APURPLE,
    pink: _APINK,
    emerald: "#10b981",
    yellow: "#eab308",
    violet: "#a855f7",
  },

  // Semantic colors
  semantic: {
    success: "#10b981",
    error: "#ec4899",
    warning: "#eab308",
    info: "#6366f1",
    danger: "#f43f5e",
  },

  // Gradient stops — derived from color primitives via hexToRgba()
  gradients: {
    primary: {
      start: hexToRgba(_P500, 0.1),
      middle: hexToRgba(_APURPLE, 0.1),
      end: hexToRgba(_APINK, 0.1),
    },
    glow: {
      start: hexToRgba(_P500, 0.3),
      end: hexToRgba(_P500, 0.6),
    },
  },

  // Celebration colors for particle animations
  celebration: {
    emeraldLight: "#34d399",
    greenLight: "#6ee7b7",
    purpleLight: "#a78bfa",
    pink: "#f472b6",
    amber: "#fbbf24",
  } as const,
} as const;

// ============================================================================
// Animation Timing
// ============================================================================

export const ANIMATION_TIMING = {
  // Durations in seconds
  duration: {
    fast: 0.15,
    normal: 0.2,
    medium: 0.3,
    mediumSlow: 0.4,
    semiSlow: 0.35,
    slow: 0.5,
    glow: 2,
    pulse: 3,
  },

  // Easing functions
  easing: {
    easeOut: [0, 0, 0.58, 1] as const,
    easeIn: [0.42, 0, 1, 1] as const,
    easeInOut: [0.42, 0, 0.58, 1] as const,
    spring: {
      stiffness: 500,
      damping: 25,
    },
    cubic: {
      default: "cubic-bezier(0.4, 0, 0.6, 1)",
      smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  // Stagger delays
  stagger: {
    default: 0.1,
    fast: 0.05,
    slow: 0.15,
  },
} as const;

// ============================================================================
// Spacing & Layout
// ============================================================================

export const SPACING = {
  // Common spacing values
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  "4xl": 32,
  "5xl": 40,
  "6xl": 48,

  // Layout values
  container: {
    max: "7xl",
    padding: {
      sm: 16,
      md: 24,
      lg: 32,
    },
  },

  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
} as const;

// ============================================================================
// Layout Constants
// ============================================================================

/**
 * Fixed layout dimensions used across components.
 * Flexy says: No hardcoded pixel values in components!
 */
export const LAYOUT = {
  /** Height of the fixed header bar (px), referenced by scroll-aware components */
  HEADER_HEIGHT_PX: 64,
  /** Wizard scroll shadow height (px) */
  SCROLL_SHADOW_HEIGHT_PX: 20,
  /** Wizard scroll shadow gradient (top) — rgba(2,6,23) is the dark-950 base bg */
  SCROLL_SHADOW_TOP_GRADIENT:
    "linear-gradient(to bottom, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0.5) 40%, transparent 100%)",
  /** Wizard scroll shadow gradient (bottom) */
  SCROLL_SHADOW_BOTTOM_GRADIENT:
    "linear-gradient(to top, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0.5) 40%, transparent 100%)",
} as const;

// ============================================================================
// CSS Transform Presets
// ============================================================================

/**
 * Predefined CSS transform values used across components.
 * Flexy says: No hardcoded transform strings in components!
 */
export const TRANSFORMS = {
  /** Standard SVG rotation for circular progress indicators */
  ROTATE_NEG_90: "rotate(-90deg)",
  /** CSS transform-origin value for ripple/pulse effects centered in element */
  ORIGIN_CENTER: "center" as const,
} as const;

// ============================================================================
// Typography
// ============================================================================

export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Fira Code", "monospace"],
  },

  // Font sizes
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

// ============================================================================
// Shadows & Effects
// ============================================================================

export const SHADOWS = {
  // Glow effects
  // Flexy says: Use hexToRgba(COLORS.*, opacity) instead of hardcoded rgba strings!
  glow: {
    primary: {
      start: `0 0 20px ${hexToRgba(COLORS.primary[500], 0.3)}`,
      end: `0 0 40px ${hexToRgba(COLORS.primary[500], 0.6)}`,
    },
    /** Scroll progress bar glow variants */
    scroll: {
      /** Subtle primary glow */
      SUBTLE: `0 0 8px ${hexToRgba(COLORS.primary[500], 0.3)}`,
      /** Medium purple glow */
      MEDIUM: `0 0 16px ${hexToRgba(COLORS.accent.purple, 0.4)}`,
      /** No glow (zero opacity) */
      NONE: `0 0 0px ${hexToRgba(COLORS.primary[500], 0)}`,
    },
  },

  /** Glow gradient for scroll progress bar */
  SCROLL_GLOW_GRADIENT: `linear-gradient(90deg, transparent, ${hexToRgba(COLORS.accent.purple, 0.3)}, transparent)`,

  // Box shadows
  box: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  },
} as const;

// ============================================================================
// Opacity & Transparencies
// ============================================================================

export const OPACITY = {
  // Common opacity values
  0: 0,
  10: 0.1,
  20: 0.2,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9,
  100: 1,

  // Semantic opacity
  disabled: 0.5,
  hover: 0.8,
  focus: 0.9,
  placeholder: 0.5,
} as const;

// ============================================================================
// Z-Index Scale
// ============================================================================

export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 100,
} as const;

// ============================================================================
// Breakpoints
// ============================================================================

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================================================
// Tailwind Theme Export
// ============================================================================

/**
 * Complete Tailwind theme configuration object
 * Use this to override or extend tailwind.config.js
 */
export const tailwindTheme = {
  colors: {
    dark: COLORS.dark,
    primary: COLORS.primary,
    accent: COLORS.accent,
  },
  fontFamily: {
    sans: TYPOGRAPHY.fontFamily.sans,
    mono: TYPOGRAPHY.fontFamily.mono,
  },
  animation: {
    glow: `glow ${ANIMATION_TIMING.duration.glow}s cubic-bezier(${ANIMATION_TIMING.easing.easeInOut.join(",")}) infinite alternate`,
    "slide-up": `slide-up ${ANIMATION_TIMING.duration.medium}s cubic-bezier(${ANIMATION_TIMING.easing.easeOut.join(",")})`,
    "slide-down": `slide-down ${ANIMATION_TIMING.duration.medium}s cubic-bezier(${ANIMATION_TIMING.easing.easeOut.join(",")})`,
    "fade-in": `fade-in ${ANIMATION_TIMING.duration.normal}s cubic-bezier(${ANIMATION_TIMING.easing.easeOut.join(",")})`,
    "pulse-slow": `pulse ${ANIMATION_TIMING.duration.pulse}s ${ANIMATION_TIMING.easing.cubic.default} infinite`,
  },
  keyframes: {
    glow: {
      "0%": { boxShadow: SHADOWS.glow.primary.start },
      "100%": { boxShadow: SHADOWS.glow.primary.end },
    },
    "slide-up": {
      "0%": { transform: "translateY(10px)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" },
    },
    "slide-down": {
      "0%": { transform: "translateY(-10px)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" },
    },
    "fade-in": {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
  },
  backgroundImage: {
    "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
    "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
    "mesh-gradient": `linear-gradient(135deg, ${COLORS.gradients.primary.start} 0%, ${COLORS.gradients.primary.middle} 50%, ${COLORS.gradients.primary.end} 100%)`,
  },
  backdropBlur: {
    xs: `${SPACING.xs}px`,
  },
} as const;

// ============================================================================
// Toast Component Animation Springs (extracted from Toast.tsx)
// Flexy says: No hardcoded animation values - everything in config!
// ============================================================================

export const TOAST_SPRING = {
  /** Spring for warning icon animation in toast */
  WARNING_ICON: { stiffness: 500, damping: 25 } as const,
  /** Spring for checkmark reveal animation in toast */
  CHECKMARK: { stiffness: 500, damping: 16, mass: 0.5 } as const,
  /** Spring for dismiss button hover animation */
  DISMISS_BUTTON: { stiffness: 400, damping: 20 } as const,
  /** Progress ring transition duration */
  PROGRESS_RING_TRANSITION: "stroke-dashoffset 0.1s linear",
  /** Progress bar CSS transition for opacity and width changes */
  PROGRESS_BAR_TRANSITION: "opacity 200ms ease-out, width 100ms linear",
  /** Progress ring default dimensions */
  PROGRESS_RING: {
    SIZE_PX: 28,
    STROKE_WIDTH: 2,
  } as const,
  /** Toast container layout */
  CONTAINER_CLASSES:
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none" as const,
} as const;

// ============================================================================
// Celebration Component Animation Springs (extracted from GenerationCelebration.tsx)
// Flexy says: No hardcoded animation values - everything in config!
// ============================================================================

export const CELEBRATION_ANIMATION = {
  /** Ripple ring animation durations */
  RIPPLE: {
    DURATION_S: 1,
    EASE: "easeOut",
  } as const,
  /** Checkmark container spring */
  CHECKMARK_CONTAINER: { stiffness: 500, damping: 30 } as const,
  /** Checkmark spring delay (seconds) */
  CHECKMARK_DELAY_S: 0.1,
  /** Circle path reveal duration */
  CIRCLE_REVEAL_DURATION_S: 0.4,
  /** Checkmark path delay */
  CHECKMARK_PATH_DELAY_S: 0.4,
  /** Text fade-in delay */
  TEXT_DELAY_S: 0.5,
  /** Particle animation easing */
  PARTICLE_EASE: [0.23, 1, 0.32, 1] as const,
} as const;

// ============================================================================
// Editor Animation Springs (extracted from editor components)
// Flexy says: No hardcoded animation values - everything in config!
// ============================================================================

export const EDITOR_ANIMATION = {
  /** Spring for active tab indicator */
  TAB_INDICATOR: { stiffness: 500, damping: 30 } as const,
  /** Spring for view mode indicator */
  VIEW_MODE_INDICATOR: { stiffness: 400, damping: 30, mass: 0.8 } as const,
  /** Spring for content stats animation */
  CONTENT_STATS: { stiffness: 500, damping: 30 } as const,
  /** Spring for tooltip spring */
  TOOLTIP_DEFAULT: { stiffness: 500, damping: 25 } as const,
  /** Spring for tab content-available dot reveal */
  CONTENT_DOT: { stiffness: 400, damping: 15 } as const,
  /** Spring for warning/limit indicator icon */
  WARNING_ICON: { stiffness: 400, damping: 12, mass: 0.5 } as const,
  /** Transition duration for stat number changes */
  STAT_NUMBER_DURATION_S: 0.1,
} as const;

// ============================================================================
// Scroll Progress Spring Configuration (extracted from ScrollProgress.tsx)
// Flexy says: No hardcoded spring values - everything in config!
// ============================================================================

export const SCROLL_PROGRESS_SPRING = {
  /** Normal motion spring config */
  DEFAULT: { stiffness: 150, damping: 20, mass: 0.5 } as const,
  /** Reduced motion spring config (stiffer = less animation) */
  REDUCED_MOTION: { stiffness: 1000, damping: 100, mass: 0.5 } as const,
  /** Page scroll progress bar — normal motion */
  PAGE_BAR_NORMAL: { stiffness: 120, damping: 20, mass: 0.5 } as const,
  /** Page scroll progress bar — reduced motion */
  PAGE_BAR_REDUCED: { stiffness: 300, damping: 30, mass: 1 } as const,
} as const;

// ============================================================================
// Animation Color Presets
// ============================================================================

/**
 * EditorHeader content-stats animation color values.
 * Used in framer-motion keyframe arrays for borderColor and boxShadow during generation.
 * Flexy says: No hardcoded rgb() strings in EditorHeader animation definitions!
 */
export const HEADER_ANIMATION = {
  CONTENT_STATS: {
    /** Keyframe sequence for border color during generation pulse */
    BORDER_COLORS: [
      "rgb(99 102 241 / 0.5)",
      "rgb(99 102 241 / 0.8)",
      "rgb(139 92 246 / 0.6)",
      "rgb(99 102 241 / 0.5)",
    ] as const,
    /** Static border color when not generating */
    BORDER_STATIC: "rgb(55 65 81 / 0.5)",
    /** Keyframe sequence for box-shadow during generation pulse */
    BOX_SHADOWS: [
      "0 0 0 0 rgb(99 102 241 / 0)",
      "0 0 12px 2px rgb(99 102 241 / 0.15)",
      "0 0 20px 4px rgb(139 92 246 / 0.1)",
      "0 0 0 0 rgb(99 102 241 / 0)",
    ] as const,
    /** Static shadow when not generating */
    SHADOW_STATIC: "0 0 0 0 transparent",
  } as const,
} as const;

/**
 * AnimatedNumber counter pulse shadow sequence.
 * Flexy says: No hardcoded rgb() shadow keyframes in AnimatedNumber!
 */
export const COUNTER_ANIMATION = {
  /** Box shadow keyframe sequence for value-change pulse effect */
  BOX_SHADOWS: [
    "0 0 0 0 rgb(99 102 241 / 0)",
    "0 0 20px 4px rgb(99 102 241 / 0.3)",
    "0 0 0 0 rgb(99 102 241 / 0)",
  ] as const,
} as const;

/**
 * Template card hover glow shadow value.
 * Flexy says: No hardcoded arbitrary shadow values in TemplateGrid!
 */
export const TEMPLATE_GLOW_SHADOW = "0 0 8px rgb(99 102 241 / 0.3)";

/**
 * CircularProgress track color default.
 * Flexy says: No hardcoded track color strings in CircularProgress!
 * Re-exported as PROGRESS_TRACK_COLOR from config/constants/ui.ts
 */
const THEME_PROGRESS_TRACK_COLOR = "rgb(255_255_255/0.1)";
export { THEME_PROGRESS_TRACK_COLOR };

/**
 * Step connector completed shadow value.
 * Flexy says: No hardcoded rgba shadow strings in STEP_CONNECTOR!
 */
export const STEP_CONNECTOR_COMPLETED_SHADOW = "0 0 6px rgba(16, 185, 129, 0.4)";

// ============================================================================
// Utility Types
// ============================================================================

export type ColorPalette = typeof COLORS;
export type AnimationTiming = typeof ANIMATION_TIMING;
export type SpacingScale = typeof SPACING;
export type Typography = typeof TYPOGRAPHY;
export type ShadowScale = typeof SHADOWS;
export type OpacityScale = typeof OPACITY;
export type ZIndexScale = typeof Z_INDEX;
export type Breakpoints = typeof BREAKPOINTS;
