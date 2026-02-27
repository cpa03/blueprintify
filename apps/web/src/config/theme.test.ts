/**
 * Theme Configuration Tests
 * Unit tests for design tokens and theme configuration
 */

import { describe, it, expect } from "vitest";
import {
  COLORS,
  ANIMATION_TIMING,
  SPACING,
  TYPOGRAPHY,
  SHADOWS,
  OPACITY,
  Z_INDEX,
  BREAKPOINTS,
  tailwindTheme,
  type ColorPalette,
  type AnimationTiming,
  type SpacingScale,
  type Typography,
  type ShadowScale,
  type OpacityScale,
  type ZIndexScale,
  type Breakpoints,
} from "./theme";

describe("Theme Configuration", () => {
  describe("COLORS", () => {
    it("should have primary color palette with all shades", () => {
      expect(COLORS.primary).toBeDefined();
      expect(COLORS.primary[50]).toBe("#eef2ff");
      expect(COLORS.primary[100]).toBe("#e0e7ff");
      expect(COLORS.primary[200]).toBe("#c7d2fe");
      expect(COLORS.primary[300]).toBe("#a5b4fc");
      expect(COLORS.primary[400]).toBe("#818cf8");
      expect(COLORS.primary[500]).toBe("#6366f1");
      expect(COLORS.primary[600]).toBe("#4f46e5");
      expect(COLORS.primary[700]).toBe("#4338ca");
      expect(COLORS.primary[800]).toBe("#3730a3");
      expect(COLORS.primary[900]).toBe("#312e81");
      expect(COLORS.primary[950]).toBe("#1e1b4b");
    });

    it("should have dark color palette with all shades", () => {
      expect(COLORS.dark).toBeDefined();
      expect(COLORS.dark[50]).toBe("#f7f7f8");
      expect(COLORS.dark[900]).toBe("#1a1a1e");
      expect(COLORS.dark[950]).toBe("#0d0d0f");
    });

    it("should have accent colors defined", () => {
      expect(COLORS.accent).toBeDefined();
      expect(COLORS.accent.cyan).toBe("#06b6d4");
      expect(COLORS.accent.purple).toBe("#8b5cf6");
      expect(COLORS.accent.pink).toBe("#ec4899");
      expect(COLORS.accent.emerald).toBe("#10b981");
      expect(COLORS.accent.yellow).toBe("#eab308");
    });

    it("should have semantic colors defined", () => {
      expect(COLORS.semantic).toBeDefined();
      expect(COLORS.semantic.success).toBe("#10b981");
      expect(COLORS.semantic.error).toBe("#ec4899");
      expect(COLORS.semantic.warning).toBe("#eab308");
      expect(COLORS.semantic.info).toBe("#6366f1");
    });

    it("should have gradient definitions", () => {
      expect(COLORS.gradients).toBeDefined();
      expect(COLORS.gradients.primary).toBeDefined();
      expect(COLORS.gradients.primary.start).toBeDefined();
      expect(COLORS.gradients.glow).toBeDefined();
    });
  });

  describe("ANIMATION_TIMING", () => {
    it("should have duration values", () => {
      expect(ANIMATION_TIMING.duration.fast).toBe(0.15);
      expect(ANIMATION_TIMING.duration.normal).toBe(0.2);
      expect(ANIMATION_TIMING.duration.medium).toBe(0.3);
      expect(ANIMATION_TIMING.duration.slow).toBe(0.5);
      expect(ANIMATION_TIMING.duration.glow).toBe(2);
      expect(ANIMATION_TIMING.duration.pulse).toBe(3);
    });

    it("should have easing functions", () => {
      expect(ANIMATION_TIMING.easing.easeOut).toBe("ease-out");
      expect(ANIMATION_TIMING.easing.easeIn).toBe("ease-in");
      expect(ANIMATION_TIMING.easing.easeInOut).toBe("ease-in-out");
    });

    it("should have spring easing with stiffness and damping", () => {
      expect(ANIMATION_TIMING.easing.spring).toBeDefined();
      expect(ANIMATION_TIMING.easing.spring.stiffness).toBeDefined();
      expect(ANIMATION_TIMING.easing.spring.damping).toBeDefined();
    });

    it("should have cubic bezier definitions", () => {
      expect(ANIMATION_TIMING.easing.cubic).toBeDefined();
      expect(ANIMATION_TIMING.easing.cubic.default).toBeDefined();
      expect(ANIMATION_TIMING.easing.cubic.smooth).toBeDefined();
    });

    it("should have stagger delays", () => {
      expect(ANIMATION_TIMING.stagger.default).toBe(0.1);
      expect(ANIMATION_TIMING.stagger.fast).toBe(0.05);
      expect(ANIMATION_TIMING.stagger.slow).toBe(0.15);
    });
  });

  describe("SPACING", () => {
    it("should have spacing scale values", () => {
      expect(SPACING.xs).toBe(2);
      expect(SPACING.sm).toBe(4);
      expect(SPACING.md).toBe(8);
      expect(SPACING.lg).toBe(12);
      expect(SPACING.xl).toBe(16);
      expect(SPACING["2xl"]).toBe(20);
      expect(SPACING["3xl"]).toBe(24);
      expect(SPACING["4xl"]).toBe(32);
      expect(SPACING["5xl"]).toBe(40);
      expect(SPACING["6xl"]).toBe(48);
    });

    it("should have container configuration", () => {
      expect(SPACING.container).toBeDefined();
      expect(SPACING.container.max).toBe("7xl");
      expect(SPACING.container.padding).toBeDefined();
    });

    it("should have border radius values", () => {
      expect(SPACING.radius).toBeDefined();
      expect(SPACING.radius.sm).toBe(4);
      expect(SPACING.radius.md).toBe(8);
      expect(SPACING.radius.lg).toBe(12);
      expect(SPACING.radius.xl).toBe(16);
      expect(SPACING.radius.full).toBe(9999);
    });
  });

  describe("TYPOGRAPHY", () => {
    it("should have font family definitions", () => {
      expect(TYPOGRAPHY.fontFamily).toBeDefined();
      expect(TYPOGRAPHY.fontFamily.sans).toBeDefined();
      expect(TYPOGRAPHY.fontFamily.mono).toBeDefined();
    });

    it("should have font size scale", () => {
      expect(TYPOGRAPHY.fontSize).toBeDefined();
      expect(TYPOGRAPHY.fontSize.xs).toBe("0.75rem");
      expect(TYPOGRAPHY.fontSize.sm).toBe("0.875rem");
      expect(TYPOGRAPHY.fontSize.base).toBe("1rem");
      expect(TYPOGRAPHY.fontSize.lg).toBe("1.125rem");
      expect(TYPOGRAPHY.fontSize.xl).toBe("1.25rem");
      expect(TYPOGRAPHY.fontSize["2xl"]).toBe("1.5rem");
      expect(TYPOGRAPHY.fontSize["3xl"]).toBe("1.875rem");
      expect(TYPOGRAPHY.fontSize["4xl"]).toBe("2.25rem");
      expect(TYPOGRAPHY.fontSize["5xl"]).toBe("3rem");
    });

    it("should have font weight values", () => {
      expect(TYPOGRAPHY.fontWeight).toBeDefined();
      expect(TYPOGRAPHY.fontWeight.normal).toBe(400);
      expect(TYPOGRAPHY.fontWeight.medium).toBe(500);
      expect(TYPOGRAPHY.fontWeight.semibold).toBe(600);
      expect(TYPOGRAPHY.fontWeight.bold).toBe(700);
    });

    it("should have line height values", () => {
      expect(TYPOGRAPHY.lineHeight).toBeDefined();
      expect(TYPOGRAPHY.lineHeight.tight).toBe(1.25);
      expect(TYPOGRAPHY.lineHeight.normal).toBe(1.5);
      expect(TYPOGRAPHY.lineHeight.relaxed).toBe(1.625);
    });
  });

  describe("SHADOWS", () => {
    it("should have glow effects", () => {
      expect(SHADOWS.glow).toBeDefined();
      expect(SHADOWS.glow.primary).toBeDefined();
      expect(SHADOWS.glow.primary.start).toBeDefined();
      expect(SHADOWS.glow.primary.end).toBeDefined();
    });

    it("should have box shadow values", () => {
      expect(SHADOWS.box).toBeDefined();
      expect(SHADOWS.box.sm).toBeDefined();
      expect(SHADOWS.box.md).toBeDefined();
      expect(SHADOWS.box.lg).toBeDefined();
      expect(SHADOWS.box.xl).toBeDefined();
      expect(SHADOWS.box["2xl"]).toBeDefined();
    });
  });

  describe("OPACITY", () => {
    it("should have numeric opacity values 0-100", () => {
      expect(OPACITY[0]).toBe(0);
      expect(OPACITY[10]).toBe(0.1);
      expect(OPACITY[20]).toBe(0.2);
      expect(OPACITY[50]).toBe(0.5);
      expect(OPACITY[80]).toBe(0.8);
      expect(OPACITY[100]).toBe(1);
    });

    it("should have semantic opacity values", () => {
      expect(OPACITY.disabled).toBe(0.5);
      expect(OPACITY.hover).toBe(0.8);
      expect(OPACITY.focus).toBe(0.9);
      expect(OPACITY.placeholder).toBe(0.5);
    });
  });

  describe("Z_INDEX", () => {
    it("should have z-index scale", () => {
      expect(Z_INDEX.hide).toBe(-1);
      expect(Z_INDEX.base).toBe(0);
      expect(Z_INDEX.dropdown).toBe(10);
      expect(Z_INDEX.sticky).toBe(20);
      expect(Z_INDEX.fixed).toBe(30);
      expect(Z_INDEX.modalBackdrop).toBe(40);
      expect(Z_INDEX.modal).toBe(50);
      expect(Z_INDEX.popover).toBe(60);
      expect(Z_INDEX.tooltip).toBe(70);
      expect(Z_INDEX.toast).toBe(80);
      expect(Z_INDEX.max).toBe(100);
    });
  });

  describe("BREAKPOINTS", () => {
    it("should have breakpoint values", () => {
      expect(BREAKPOINTS.sm).toBe("640px");
      expect(BREAKPOINTS.md).toBe("768px");
      expect(BREAKPOINTS.lg).toBe("1024px");
      expect(BREAKPOINTS.xl).toBe("1280px");
      expect(BREAKPOINTS["2xl"]).toBe("1536px");
    });
  });

  describe("tailwindTheme", () => {
    it("should export colors configuration", () => {
      expect(tailwindTheme.colors).toBeDefined();
      expect(tailwindTheme.colors.dark).toBeDefined();
      expect(tailwindTheme.colors.primary).toBeDefined();
      expect(tailwindTheme.colors.accent).toBeDefined();
    });

    it("should export font family configuration", () => {
      expect(tailwindTheme.fontFamily).toBeDefined();
      expect(tailwindTheme.fontFamily.sans).toBeDefined();
      expect(tailwindTheme.fontFamily.mono).toBeDefined();
    });

    it("should have animation keyframes defined", () => {
      expect(tailwindTheme.animation).toBeDefined();
      expect(tailwindTheme.animation.glow).toBeDefined();
      expect(tailwindTheme.animation["slide-up"]).toBeDefined();
      expect(tailwindTheme.animation["slide-down"]).toBeDefined();
      expect(tailwindTheme.animation["fade-in"]).toBeDefined();
      expect(tailwindTheme.animation["pulse-slow"]).toBeDefined();
    });

    it("should have keyframes defined", () => {
      expect(tailwindTheme.keyframes).toBeDefined();
      expect(tailwindTheme.keyframes.glow).toBeDefined();
      expect(tailwindTheme.keyframes["slide-up"]).toBeDefined();
      expect(tailwindTheme.keyframes["slide-down"]).toBeDefined();
      expect(tailwindTheme.keyframes["fade-in"]).toBeDefined();
    });

    it("should have background image definitions", () => {
      expect(tailwindTheme.backgroundImage).toBeDefined();
      expect(tailwindTheme.backgroundImage["gradient-radial"]).toBeDefined();
      expect(tailwindTheme.backgroundImage["gradient-conic"]).toBeDefined();
      expect(tailwindTheme.backgroundImage["mesh-gradient"]).toBeDefined();
    });
  });

  describe("Type exports", () => {
    it("should export ColorPalette type", () => {
      const colors: ColorPalette = COLORS;
      expect(colors).toBeDefined();
    });

    it("should export AnimationTiming type", () => {
      const timing: AnimationTiming = ANIMATION_TIMING;
      expect(timing).toBeDefined();
    });

    it("should export SpacingScale type", () => {
      const spacing: SpacingScale = SPACING;
      expect(spacing).toBeDefined();
    });

    it("should export Typography type", () => {
      const typography: Typography = TYPOGRAPHY;
      expect(typography).toBeDefined();
    });

    it("should export ShadowScale type", () => {
      const shadows: ShadowScale = SHADOWS;
      expect(shadows).toBeDefined();
    });

    it("should export OpacityScale type", () => {
      const opacity: OpacityScale = OPACITY;
      expect(opacity).toBeDefined();
    });

    it("should export ZIndexScale type", () => {
      const zIndex: ZIndexScale = Z_INDEX;
      expect(zIndex).toBeDefined();
    });

    it("should export Breakpoints type", () => {
      const breakpoints: Breakpoints = BREAKPOINTS;
      expect(breakpoints).toBeDefined();
    });
  });
});
