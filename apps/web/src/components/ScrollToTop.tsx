import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyboardShortcutTooltip } from "./SmartTooltip";

interface ScrollToTopProps {
  scrollContainerRef?: React.RefObject<HTMLElement>;
  showAfter?: number;
}

export function ScrollToTop({
  scrollContainerRef,
  showAfter = 400,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const getScrollContainer = useCallback(() => {
    return scrollContainerRef?.current || window;
  }, [scrollContainerRef]);

  const getScrollY = useCallback(() => {
    if (scrollContainerRef?.current) {
      return scrollContainerRef.current.scrollTop;
    }
    return window.scrollY;
  }, [scrollContainerRef]);

  const scrollToTop = useCallback(() => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [scrollContainerRef]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = getScrollY();
      setHasScrolled(scrollY > 50);
      setIsVisible(scrollY > showAfter);
    };

    const container = getScrollContainer();
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [getScrollContainer, getScrollY, showAfter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Home" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA";

        if (!isInputFocused && hasScrolled) {
          e.preventDefault();
          scrollToTop();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollToTop, hasScrolled]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8,
          }}
          className="absolute bottom-4 right-4 z-20"
        >
          <KeyboardShortcutTooltip
            shortcut="Home"
            description="Scroll to top"
            position="left"
            modifier="none"
          >
            <motion.button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full glass-card border-primary-500/30 
                         flex items-center justify-center
                         text-primary-400 hover:text-white
                         hover:bg-primary-500/20 hover:border-primary-500/50
                         focus:outline-none focus:ring-2 focus:ring-primary-500/50
                         shadow-lg shadow-primary-500/10
                         transition-colors duration-200"
              aria-label="Scroll to top (Home key)"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ y: 2 }}
                animate={{ y: [2, -2, 2] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </motion.svg>
            </motion.button>
          </KeyboardShortcutTooltip>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
