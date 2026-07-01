import { memo } from "react";
import { SKIP_LINK_ANIMATION } from "../config/constants";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Z_INDEX } from "../config/theme";

export const SkipLink = memo(function SkipLink(): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 focus:px-4 focus:py-2.5 focus:rounded-xl focus:font-medium
                 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:ring-offset-2 focus:ring-offset-dark-950
                 group
                 bg-gradient-to-r from-primary-600 to-primary-500
                 text-white shadow-lg shadow-primary-500/25
                 backdrop-blur-sm
                 focus:opacity-100 focus:translate-y-0 focus:scale-100
                 opacity-0 -translate-y-5 scale-90
                 transition-all duration-300 ease-out
                 hover:scale-[1.02]"
      style={{
        willChange: shouldReduceMotion ? "auto" : "transform, opacity",
        zIndex: Z_INDEX.max,
      }}
    >
      <span className="flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{
            animation: shouldReduceMotion ? "none" : SKIP_LINK_ANIMATION.ARROW_BOUNCE,
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
        <span>Skip to main content</span>
      </span>
      <span
        className="absolute inset-0 rounded-xl bg-primary-400/20 blur-md -z-10"
        style={{
          animation: shouldReduceMotion ? "none" : SKIP_LINK_ANIMATION.GLOW_PULSE,
        }}
      />
      <style>
        {SKIP_LINK_ANIMATION.ARROW_BOUNCE_KEYFRAMES}
        {SKIP_LINK_ANIMATION.GLOW_PULSE_KEYFRAMES}
      </style>
    </a>
  );
});
