import { memo } from "react";

/**
 * SkipLink - Accessibility component for keyboard navigation
 *
 * Provides a hidden link that becomes visible when focused, allowing
 * keyboard users to skip directly to the main content. This is a
 * WCAG 2.1 Level A requirement (Success Criterion 2.4.1).
 *
 * Features:
 * - Glassmorphism design for premium visual appearance
 * - Subtle glow animation for enhanced feedback
 * - CSS transitions and keyframes for smooth animations
 * - Icon for improved visual recognition
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html
 */

/* Keyframes injected once via style tag for the skip-link animations */
const skipLinkStyles = {
  arrowBounce: `@keyframes skip-arrow-bounce { 0%,100% { transform: translateX(0); } 50% { transform: translateX(3px); } }`,
  glowPulse: `@keyframes skip-glow-pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }`,
};

export const SkipLink = memo(function SkipLink(): JSX.Element {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] 
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
        willChange: "transform, opacity",
      }}
    >
      <span className="flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ animation: "skip-arrow-bounce 1.2s ease-in-out infinite" }}
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
        style={{ animation: "skip-glow-pulse 2s ease-in-out infinite" }}
      />
      <style>
        {skipLinkStyles.arrowBounce}
        {skipLinkStyles.glowPulse}
      </style>
    </a>
  );
});
