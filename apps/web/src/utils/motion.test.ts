/**
 * Motion Utilities Tests
 * Unit tests for Framer Motion animation variants
 */

import { ANIMATION_DIRECTIONS } from "@blueprint/shared/config";
import { describe, it, expect } from "vitest";
import { MOTION_OFFSETS } from "../config/constants";
import {
  transitions,
  fadeInUp,
  staggerContainer,
  fadeIn,
  scaleIn,
  slideInRight,
  slideInLeft,
  floatingAnimation,
  pulseAnimation,
  pageTransition,
  createStaggerContainer,
  createFadeInUp,
} from "./motion";

describe("Motion Utilities", () => {
  describe("transitions", () => {
    it("should have fast, normal, slow, and spring transitions", () => {
      expect(transitions).toBeDefined();
      expect(transitions.fast).toBeDefined();
      expect(transitions.normal).toBeDefined();
      expect(transitions.slow).toBeDefined();
      expect(transitions.spring).toBeDefined();
    });

    it("should have spring transition with type property", () => {
      expect(transitions.spring).toBeDefined();
      expect(transitions.spring.type).toBe("spring");
    });
  });

  describe("fadeInUp", () => {
    it("should export fadeInUp variant", () => {
      expect(fadeInUp).toBeDefined();
      expect(typeof fadeInUp).toBe("object");
    });

    it("should have hidden and visible states", () => {
      expect(fadeInUp.hidden).toBeDefined();
      expect(fadeInUp.visible).toBeDefined();
    });

    it("should use MOTION_OFFSETS.FADE_IN_Y_PX for hidden y-offset", () => {
      expect(fadeInUp.hidden).toEqual({ opacity: 0, y: MOTION_OFFSETS.FADE_IN_Y_PX });
    });
  });

  describe("staggerContainer", () => {
    it("should export staggerContainer variant", () => {
      expect(staggerContainer).toBeDefined();
      expect(typeof staggerContainer).toBe("object");
    });

    it("should have hidden and visible states", () => {
      expect(staggerContainer.hidden).toBeDefined();
      expect(staggerContainer.visible).toBeDefined();
    });
  });

  describe("fadeIn", () => {
    it("should export fadeIn variant", () => {
      expect(fadeIn).toBeDefined();
      expect(typeof fadeIn).toBe("object");
    });

    it("should have hidden and visible states", () => {
      expect(fadeIn.hidden).toBeDefined();
      expect(fadeIn.visible).toBeDefined();
    });
  });

  describe("scaleIn", () => {
    it("should export scaleIn variant", () => {
      expect(scaleIn).toBeDefined();
      expect(typeof scaleIn).toBe("object");
    });

    it("should have hidden and visible states", () => {
      expect(scaleIn.hidden).toBeDefined();
      expect(scaleIn.visible).toBeDefined();
    });

    it("should use MOTION_OFFSETS.SCALE_INITIAL for hidden scale", () => {
      expect(scaleIn.hidden).toEqual({ opacity: 0, scale: MOTION_OFFSETS.SCALE_INITIAL });
    });
  });

  describe("slideInRight", () => {
    it("should export slideInRight variant", () => {
      expect(slideInRight).toBeDefined();
      expect(typeof slideInRight).toBe("object");
    });

    it("should have hidden and visible states", () => {
      expect(slideInRight.hidden).toBeDefined();
      expect(slideInRight.visible).toBeDefined();
    });

    it("should use MOTION_OFFSETS.SLIDE_RIGHT_X_PX for hidden x-offset", () => {
      expect(slideInRight.hidden).toEqual({ opacity: 0, x: MOTION_OFFSETS.SLIDE_RIGHT_X_PX });
    });
  });

  describe("slideInLeft", () => {
    it("should export slideInLeft variant", () => {
      expect(slideInLeft).toBeDefined();
      expect(typeof slideInLeft).toBe("object");
    });

    it("should have hidden and visible states", () => {
      expect(slideInLeft.hidden).toBeDefined();
      expect(slideInLeft.visible).toBeDefined();
    });

    it("should use MOTION_OFFSETS.SLIDE_LEFT_X_PX for hidden x-offset", () => {
      expect(slideInLeft.hidden).toEqual({ opacity: 0, x: MOTION_OFFSETS.SLIDE_LEFT_X_PX });
    });
  });

  describe("floatingAnimation", () => {
    it("should export floatingAnimation", () => {
      expect(floatingAnimation).toBeDefined();
      expect(typeof floatingAnimation).toBe("object");
    });

    it("should use MOTION_OFFSETS.FLOAT_Y_RANGE for y keyframes", () => {
      expect(floatingAnimation.y).toEqual(MOTION_OFFSETS.FLOAT_Y_RANGE);
    });

    it("should have transition with infinite repeat", () => {
      expect(floatingAnimation.transition).toBeDefined();
      expect(floatingAnimation.transition.repeat).toBe(Infinity);
    });
  });

  describe("pulseAnimation", () => {
    it("should export pulseAnimation", () => {
      expect(pulseAnimation).toBeDefined();
      expect(typeof pulseAnimation).toBe("object");
    });

    it("should use MOTION_OFFSETS.PULSE_SCALE_RANGE for scale keyframes", () => {
      expect(pulseAnimation.scale).toEqual(MOTION_OFFSETS.PULSE_SCALE_RANGE);
    });

    it("should use MOTION_OFFSETS.PULSE_OPACITY_RANGE for opacity keyframes", () => {
      expect(pulseAnimation.opacity).toEqual(MOTION_OFFSETS.PULSE_OPACITY_RANGE);
    });

    it("should have transition with infinite repeat", () => {
      expect(pulseAnimation.transition).toBeDefined();
      expect(pulseAnimation.transition.repeat).toBe(Infinity);
    });
  });

  describe("pageTransition", () => {
    it("should export pageTransition as a function", () => {
      expect(pageTransition).toBeDefined();
      expect(typeof pageTransition).toBe("function");
    });

    it("should default to forward direction", () => {
      const transition = pageTransition();
      expect(transition.initial).toBeDefined();
      expect(transition.animate).toBeDefined();
      expect(transition.exit).toBeDefined();
      // forward: enters from below, exits upward
      expect(transition.initial).toEqual({ opacity: 0, y: MOTION_OFFSETS.PAGE_TRANSITION_Y_PX });
      expect(transition.animate).toEqual({ opacity: 1, y: 0 });
      expect(transition.exit).toEqual({ opacity: 0, y: -MOTION_OFFSETS.PAGE_TRANSITION_Y_PX });
    });

    it("should return backward variant when direction is backward", () => {
      const transition = pageTransition(ANIMATION_DIRECTIONS.BACKWARD);
      expect(transition.initial).toBeDefined();
      expect(transition.animate).toBeDefined();
      expect(transition.exit).toBeDefined();
      // backward: enters from above, exits downward
      expect(transition.initial).toEqual({ opacity: 0, y: -MOTION_OFFSETS.PAGE_TRANSITION_Y_PX });
      expect(transition.animate).toEqual({ opacity: 1, y: 0 });
      expect(transition.exit).toEqual({ opacity: 0, y: MOTION_OFFSETS.PAGE_TRANSITION_Y_PX });
    });

    it("should return forward variant when direction is forward", () => {
      const transition = pageTransition(ANIMATION_DIRECTIONS.FORWARD);
      expect(transition.initial).toEqual({ opacity: 0, y: MOTION_OFFSETS.PAGE_TRANSITION_Y_PX });
      expect(transition.animate).toEqual({ opacity: 1, y: 0 });
      expect(transition.exit).toEqual({ opacity: 0, y: -MOTION_OFFSETS.PAGE_TRANSITION_Y_PX });
    });
  });

  describe("createStaggerContainer", () => {
    it("should be a function", () => {
      expect(createStaggerContainer).toBeDefined();
      expect(typeof createStaggerContainer).toBe("function");
    });

    it("should create variants with default values", () => {
      const variants = createStaggerContainer();
      expect(variants).toBeDefined();
      expect(variants.hidden).toBeDefined();
      expect(variants.visible).toBeDefined();
    });

    it("should create variants with custom stagger values", () => {
      const variants = createStaggerContainer(0.05, 0.1);
      expect(variants).toBeDefined();
      expect(variants.visible).toBeDefined();
    });
  });

  describe("createFadeInUp", () => {
    it("should be a function", () => {
      expect(createFadeInUp).toBeDefined();
      expect(typeof createFadeInUp).toBe("function");
    });

    it("should create variants with default duration", () => {
      const variants = createFadeInUp();
      expect(variants).toBeDefined();
      expect(variants.hidden).toBeDefined();
      expect(variants.visible).toBeDefined();
    });

    it("should use MOTION_OFFSETS.FADE_IN_Y_PX for hidden y-offset", () => {
      const variants = createFadeInUp();
      expect(variants.hidden).toEqual({ opacity: 0, y: MOTION_OFFSETS.FADE_IN_Y_PX });
    });

    it("should create variants with custom duration", () => {
      const variants = createFadeInUp(0.3);
      expect(variants).toBeDefined();
      expect(variants.visible).toBeDefined();
    });
  });
});
