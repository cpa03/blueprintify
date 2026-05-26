/**
 * ConfirmDialog Component
 *
 * An animated confirmation dialog for destructive actions.
 * Uses Framer Motion for enter/exit animations, matching the
 * same pattern as KeyboardShortcutsModal for consistency.
 *
 * Features:
 * - Escape key to cancel
 * - Spring animations matching the app's design language
 * - Focus trap within dialog
 * - Glassmorphism design
 * - Accessible ARIA attributes (role="dialog", aria-modal)
 * - Backdrop blur overlay
 *
 * @module components/ConfirmDialog
 *
 * @example
 * ```tsx
 * const [showDialog, setShowDialog] = useState(false);
 *
 * <ConfirmDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onConfirm={() => {
 *     resetAllStores();
 *     setShowDialog(false);
 *   }}
 *   title="Start New Project?"
 *   description="This will clear all your current content. This action cannot be undone."
 *   confirmLabel="Start New"
 *   cancelLabel="Cancel"
 * />
 * ```
 */

import { useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_CONFIG } from "../config/constants";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Props for the ConfirmDialog component.
 */
interface ConfirmDialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean;
  /** Called when the dialog should close (cancel/overlay click/Escape) */
  onClose: () => void;
  /** Called when the user confirms the action */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Dialog description/message */
  description: string;
  /** Label for the confirm button (default: "Confirm") */
  confirmLabel?: string;
  /** Label for the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Emoji icon to display (default: "⚠️") */
  icon?: string;
}

/**
 * Animated confirmation dialog for destructive or important actions.
 *
 * @param props - Component props
 * @returns The rendered dialog or null when closed
 */
export const ConfirmDialog = memo(function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon = "⚠️",
}: ConfirmDialogProps): JSX.Element {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Focus trap: trap focus within the dialog when open
  useEffect(() => {
    if (!isOpen) return;

    lastActiveElement.current = document.activeElement as HTMLElement;
    confirmButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Simple focus trap: Tab and Shift+Tab cycle between the two buttons
      if (e.key === "Tab") {
        const focusableElements = [
          confirmButtonRef.current,
          // The cancel button is the only other focusable element
          ...(document.querySelectorAll('[data-confirm-cancel="true"]') as NodeListOf<HTMLElement>),
        ].filter(Boolean) as HTMLElement[];

        if (focusableElements.length < 2) return;

        const first = focusableElements[0] as HTMLElement;
        const last = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      lastActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: "spring",
              ...SPRING_CONFIG.GENTLE,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
          >
            <div
              className="glass-card w-full max-w-md p-6 shadow-2xl shadow-dark-950/50 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-pink/20 flex items-center justify-center flex-shrink-0">
                  <motion.span
                    className="text-2xl"
                    aria-hidden="true"
                    initial={shouldReduceMotion ? {} : { scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 260,
                            damping: 8,
                            mass: 0.6,
                          }
                    }
                  >
                    {icon}
                  </motion.span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 id="confirm-dialog-title" className="text-lg font-bold text-white mb-1">
                    {title}
                  </h2>
                  <p
                    id="confirm-dialog-description"
                    className="text-sm text-dark-400 leading-relaxed"
                  >
                    {description}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  data-confirm-cancel="true"
                  className="btn-ghost px-4 py-2 rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                >
                  {cancelLabel}
                </motion.button>
                <motion.button
                  ref={confirmButtonRef}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="bg-accent-pink hover:bg-accent-pink/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                >
                  {confirmLabel}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
