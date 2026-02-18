import { motion } from "framer-motion";

/**
 * SkipLink - Accessibility component for keyboard navigation
 *
 * Provides a hidden link that becomes visible when focused, allowing
 * keyboard users to skip directly to the main content. This is a
 * WCAG 2.1 Level A requirement (Success Criterion 2.4.1).
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html
 */
export function SkipLink() {
  return (
    <motion.a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-dark-950"
      initial={{ opacity: 0, y: -10 }}
      whileFocus={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      Skip to main content
    </motion.a>
  );
}
