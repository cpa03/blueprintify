/**
 * @fileoverview Application header component with branding and navigation.
 *
 * This component provides:
 * - App logo and branding with gradient icon
 * - Keyboard shortcuts button (optional)
 * - GitHub repository link
 * - Scroll-triggered shadow for depth feedback
 *
 * The header uses glass morphism styling with backdrop blur and
 * Framer Motion for entrance animations. It's fixed at the top of
 * the viewport with proper z-index layering. When scrolled past
 * a 20px threshold, the border and shadow strengthen to provide
 * a subtle depth cue that content is behind the header.
 *
 * @module components/Header
 */

import { memo, useState, useEffect, useRef } from "react";
import {
  UI_CONTENT,
  EXTERNAL_URLS,
  SCROLL_THRESHOLDS,
  ACCESSIBILITY_LABELS,
} from "../config/constants";
import { RippleButton } from "./RippleButton";
import { KeyboardShortcutTooltip } from "./SmartTooltip";

/**
 * Props for the Header component.
 */
interface HeaderProps {
  /** Callback fired when keyboard shortcuts button is clicked. */
  onShowShortcuts?: () => void;
}

/**
 * Application header component with branding and navigation.
 *
 * @param props - Component props
 * @param props.onShowShortcuts - Optional callback for keyboard shortcuts modal
 * @returns The rendered header element
 * @example
 * // Basic usage
 * <Header />
 * @example
 * // With shortcuts button
 * <Header onShowShortcuts={() => setShowShortcuts(true)} />
 */
function HeaderComponent({ onShowShortcuts }: HeaderProps): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDiscoveryHint, setShowDiscoveryHint] = useState(true);
  const hintShownRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLDS.HEADER_SHADOW);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // One-shot discovery hint for the keyboard shortcuts button — a subtle glow
  // pulse during the first few seconds after mount that helps users discover
  // the keyboard shortcut modal. Only plays once per page load session.
  useEffect(() => {
    if (onShowShortcuts && !hintShownRef.current) {
      hintShownRef.current = true;
      const timer = setTimeout(() => setShowDiscoveryHint(false), 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [onShowShortcuts]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 glass-card backdrop-blur-xl transition-all duration-300 ${
        isScrolled
          ? "border-b border-dark-600/60 shadow-lg shadow-dark-950/30"
          : "border-b border-dark-700/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 animate-fade-in-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="text-xl font-bold text-white">{UI_CONTENT.APP.NAME}</div>
            <p className="text-xs text-dark-400">{UI_CONTENT.APP.TAGLINE}</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 animate-slide-in-right">
          {onShowShortcuts && (
            <KeyboardShortcutTooltip
              shortcut="?"
              description="Show keyboard shortcuts"
              position="bottom"
              modifier="none"
            >
              <RippleButton
                onClick={onShowShortcuts}
                className={`btn-ghost flex items-center justify-center w-10 h-10 ${showDiscoveryHint ? "attention-glow" : ""}`}
                ariaLabel={ACCESSIBILITY_LABELS.HEADER.KEYBOARD_SHORTCUTS}
                title={ACCESSIBILITY_LABELS.HEADER.KEYBOARD_SHORTCUTS}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </RippleButton>
            </KeyboardShortcutTooltip>
          )}
          <RippleButton
            onClick={() => window.open(EXTERNAL_URLS.GITHUB, "_blank", "noopener,noreferrer")}
            className="btn-ghost flex items-center gap-2"
            ariaLabel={ACCESSIBILITY_LABELS.HEADER.GITHUB}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hidden sm:inline">{UI_CONTENT.BUTTONS.GITHUB}</span>
          </RippleButton>
        </nav>
      </div>
    </header>
  );
}

/**
 * Memoized header component export.
 * Re-renders only when onShowShortcuts prop changes.
 */
export const Header = memo(HeaderComponent);
