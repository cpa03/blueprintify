import { motion } from "framer-motion";

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
 * - Spring physics for smooth transitions
 * - Icon for improved visual recognition
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html
 */
export function SkipLink() {
  return (
    <motion.a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] 
                 focus:px-4 focus:py-2.5 focus:rounded-xl focus:font-medium
                 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:ring-offset-2 focus:ring-offset-dark-950
                 group
                 bg-gradient-to-r from-primary-600 to-primary-500
                 text-white shadow-lg shadow-primary-500/25
                 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      whileFocus={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      }}
      whileHover={{ scale: 1.02 }}
    >
      <span className="flex items-center gap-2">
        <motion.svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={{ x: 0 }}
          animate={{ x: [0, 3, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </motion.svg>
        <span>Skip to main content</span>
      </span>
      <motion.span
        className="absolute inset-0 rounded-xl bg-primary-400/20 blur-md -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.a>
  );
}
