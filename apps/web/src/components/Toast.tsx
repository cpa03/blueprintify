/**
 * Toast Notification Component
 *
 * Displays toast notifications with auto-dismiss functionality and visual progress
 * indicators. Supports multiple toast types via TOAST_TYPES (SUCCESS, ERROR, WARNING, INFO) with
 * distinct styling and icons.
 *
 * Features:
 * - Auto-dismiss with configurable duration
 * - Visual progress ring showing remaining time
 * - Pause on hover for extended reading time
 * - Smooth enter/exit animations via Framer Motion
 * - Accessible with ARIA live regions for screen readers
 *
 * @see apps/web/src/store/toast.ts - Toast state management store
 * @see apps/web/src/config/constants.ts - TOAST_CONFIG for styling and icons
 *
 * @example
 * ```tsx
 * // ToastContainer is typically rendered at the app root
 * <ToastContainer />
 *
 * // Display toasts using the useToast hook
 * const toast = useToast();
 * toast.success("Operation completed!");
 * toast.error("Something went wrong");
 * ```
 */

import { useState, useRef, useCallback, useEffect, forwardRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore, type ToastType, type Toast } from "../store/toast";
import { TOAST_CONFIG, SPRING_CONFIG, ACCESSIBILITY_LABELS, ANIMATION } from "../config/constants";
import { TOAST_SPRING, TRANSFORMS } from "../config/theme";
import { TOAST_TYPES } from "@blueprint/shared";
import { useReducedMotion } from "../hooks/useReducedMotion";

const toastIcons: Record<ToastType, string> = {
  [TOAST_TYPES.SUCCESS]: TOAST_CONFIG.ICONS.SUCCESS,
  [TOAST_TYPES.ERROR]: TOAST_CONFIG.ICONS.ERROR,
  [TOAST_TYPES.WARNING]: TOAST_CONFIG.ICONS.WARNING,
  [TOAST_TYPES.INFO]: TOAST_CONFIG.ICONS.INFO,
};

const toastStyles: Record<ToastType, string> = {
  [TOAST_TYPES.SUCCESS]: TOAST_CONFIG.STYLES.SUCCESS,
  [TOAST_TYPES.ERROR]: TOAST_CONFIG.STYLES.ERROR,
  [TOAST_TYPES.WARNING]: TOAST_CONFIG.STYLES.WARNING,
  [TOAST_TYPES.INFO]: TOAST_CONFIG.STYLES.INFO,
};

// Circular progress ring component
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const ProgressRing = memo(function ProgressRing({
  progress,
  size = TOAST_SPRING.PROGRESS_RING.SIZE_PX,
  strokeWidth = TOAST_SPRING.PROGRESS_RING.STROKE_WIDTH,
  color = "currentColor",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="absolute pointer-events-none"
      style={{ transform: TRANSFORMS.ROTATE_NEG_90 }}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={0.15}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{
          transition: TOAST_SPRING.PROGRESS_RING_TRANSITION,
        }}
      />
    </svg>
  );
});

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  staggerIndex?: number;
}

const TOAST_STAGGER_MS = TOAST_CONFIG.STAGGER_MS;

const ToastItem = memo(
  forwardRef<HTMLDivElement, ToastItemProps>(function ToastItem(
    { toast, onRemove, staggerIndex = 0 },
    ref
  ) {
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(100);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const remainingTimeRef = useRef<number>(toast.duration ?? TOAST_CONFIG.DEFAULT_DURATION);
    const startTimeRef = useRef<number>(0);
    const durationRef = useRef<number>(toast.duration ?? TOAST_CONFIG.DEFAULT_DURATION);
    const originalDurationRef = useRef<number>(toast.duration ?? TOAST_CONFIG.DEFAULT_DURATION);
    const rafRef = useRef<number | null>(null);
    const shouldReduceMotion = useReducedMotion();

    const clearToastTimeout = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }, []);

    const startDismissTimer = useCallback(
      (remaining: number) => {
        clearToastTimeout();

        const startTime = Date.now();
        startTimeRef.current = startTime;
        durationRef.current = remaining;

        // Calculate the correct initial progress relative to the original duration.
        // When resuming after hover-pause, this prevents the ring from jumping
        // back to 100% — it smoothly continues from where it paused.
        const initialProgress = Math.round((remaining / originalDurationRef.current) * 100);
        setProgress(initialProgress);

        const animateProgress = () => {
          const elapsed = Date.now() - startTime;
          const newProgress = Math.max(0, initialProgress * (1 - elapsed / remaining));
          setProgress(newProgress);

          if (newProgress > 0 && !isHovered) {
            rafRef.current = requestAnimationFrame(animateProgress);
          }
        };
        rafRef.current = requestAnimationFrame(animateProgress);

        timeoutRef.current = setTimeout(() => {
          onRemove(toast.id);
        }, remaining);
      },
      [toast.id, onRemove, isHovered, clearToastTimeout]
    );

    useEffect(() => {
      startDismissTimer(toast.duration ?? TOAST_CONFIG.DEFAULT_DURATION);

      return () => {
        clearToastTimeout();
      };
    }, [toast.id, toast.duration, startDismissTimer, clearToastTimeout]);

    useEffect(() => {
      if (isHovered) {
        clearToastTimeout();
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, durationRef.current - elapsed);
      } else {
        if (remainingTimeRef.current > 0) {
          startDismissTimer(remainingTimeRef.current);
        }
      }
    }, [isHovered, startDismissTimer, clearToastTimeout]);

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const defaultTransition = {
      type: "spring" as const,
      ...SPRING_CONFIG.DEFAULT,
      delay: staggerIndex * (TOAST_STAGGER_MS / 1000),
    };

    const reducedTransition = {
      duration: ANIMATION.NORMAL,
      delay: staggerIndex * (TOAST_STAGGER_MS / 1000),
      ease: "easeOut" as const,
    };

    // For error/warning toasts, use role="alert" so screen readers announce
    // them immediately. Success/info toasts keep role="status" with polite
    // announcements — advisory information that isn't time-sensitive.
    const isAlert = toast.type === TOAST_TYPES.ERROR || toast.type === TOAST_TYPES.WARNING;
    const toastRole = isAlert ? "alert" : "status";
    const toastAriaLive = isAlert ? undefined : "polite";

    return (
      <motion.div
        ref={ref}
        {...(shouldReduceMotion
          ? {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              transition: reducedTransition,
            }
          : {
              layout: true,
              initial: { opacity: 0, y: 20, scale: 0.9 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: -20, scale: 0.9 },
              transition: defaultTransition,
            })}
        className={`pointer-events-auto px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg flex items-center gap-3 min-w-[280px] max-w-md relative overflow-hidden group ${toastStyles[toast.type]}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        role={toastRole}
        aria-live={toastAriaLive}
      >
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30"
          style={{
            width: `${progress}%`,
            opacity: isHovered ? 0 : 0.3,
            transition: "opacity 200ms ease-out, width 100ms linear",
          }}
          aria-hidden="true"
        />

        {/* Hover glow ring — subtle inset glow that gently "catches" the toast
            when paused, reinforcing the paused state visually. Uses currentColor
            which inherits from the toast type (success/error/warning/info), so
            the glow color always matches naturally. */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovered ? 1 : 0,
            boxShadow: `inset 0 0 24px 0 color-mix(in srgb, currentColor 10%, transparent)`,
          }}
          aria-hidden="true"
        />

        {shouldReduceMotion ? (
          isHovered && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 bg-current/20 rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                className="w-2.5 h-2.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </div>
          )
        ) : (
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 5 }}
                transition={{ type: "spring", ...TOAST_SPRING.WARNING_ICON }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-current/20 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-2.5 h-2.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <span className="relative flex-shrink-0 w-7 h-7 flex items-center justify-center">
          <ProgressRing progress={progress} size={28} strokeWidth={2} />
          {shouldReduceMotion ? (
            <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center font-bold text-sm relative z-10">
              {toastIcons[toast.type]}
            </span>
          ) : (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                ...TOAST_SPRING.CHECKMARK,
                delay: 0.12,
              }}
              className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center font-bold text-sm relative z-10"
            >
              {toastIcons[toast.type]}
            </motion.span>
          )}
        </span>
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        {shouldReduceMotion ? (
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/50 rounded p-1 transition-colors"
            aria-label={ACCESSIBILITY_LABELS.TOAST.DISMISS(toast.type)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        ) : (
          <motion.button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/50 rounded p-1 transition-colors"
            aria-label={ACCESSIBILITY_LABELS.TOAST.DISMISS(toast.type)}
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", ...TOAST_SPRING.DISMISS_BUTTON }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        )}
      </motion.div>
    );
  })
);

function ToastContainerComponent(): JSX.Element {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  const clearAll = useToastStore((state) => state.clearAll);
  const showDismissAll = toasts.length > 1;
  const shouldReduceMotion = useReducedMotion();
  const [dismissAnnouncement, setDismissAnnouncement] = useState("");

  const handleClearAll = useCallback(() => {
    const count = toasts.length;
    clearAll();
    setDismissAnnouncement(`Dismissed all ${count} notifications`);
  }, [clearAll, toasts.length]);

  // Clear the dismiss announcement after screen readers have had time to
  // announce it. A short timeout prevents the sr-only region from accumulating
  // stale text that would be re-announced on subsequent dismiss-all actions.
  useEffect(() => {
    if (!dismissAnnouncement) return;
    const timer = setTimeout(() => setDismissAnnouncement(""), 3000);
    return () => clearTimeout(timer);
  }, [dismissAnnouncement]);

  // Container entrance animation — a gentle fade+slide-up that smooths the
  // initial appearance of the toast panel. Without this, the container
  // pops in abruptly when the first toast fires. The subtle spring gives
  // a polished "surface rising into view" feel that matches the toast
  // item animations. Disabled when reduced motion is preferred.
  const containerAnimation = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { type: "spring" as const, ...SPRING_CONFIG.SNAPPY },
      };

  return (
    <motion.div className={TOAST_SPRING.CONTAINER_CLASSES} {...containerAnimation}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} staggerIndex={index} />
        ))}
      </AnimatePresence>

      {shouldReduceMotion ? (
        showDismissAll && (
          <button
            onClick={handleClearAll}
            className="pointer-events-auto self-center mt-1 px-3 py-1.5 rounded-lg
                       text-xs font-medium text-dark-400
                       bg-dark-800/80 backdrop-blur-sm border border-dark-700/50
                       hover:text-white hover:bg-dark-700 hover:border-dark-600
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
                       transition-all duration-200"
            aria-label={ACCESSIBILITY_LABELS.TOAST.DISMISS_ALL(toasts.length)}
          >
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Dismiss all (
              <span className="tabular-nums" aria-hidden="true">
                {toasts.length}
              </span>
              )
            </span>
          </button>
        )
      ) : (
        <AnimatePresence>
          {showDismissAll && (
            <motion.button
              initial={{ opacity: 0, y: -8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{ type: "spring", ...SPRING_CONFIG.SNAPPY }}
              onClick={handleClearAll}
              className="pointer-events-auto self-center mt-1 px-3 py-1.5 rounded-lg
                         text-xs font-medium text-dark-400
                         bg-dark-800/80 backdrop-blur-sm border border-dark-700/50
                         hover:text-white hover:bg-dark-700 hover:border-dark-600
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
                         transition-all duration-200"
              aria-label={ACCESSIBILITY_LABELS.TOAST.DISMISS_ALL(toasts.length)}
            >
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Dismiss all (
                <motion.span
                  key={toasts.length}
                  className="tabular-nums"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15, mass: 0.5 }}
                  aria-hidden="true"
                >
                  {toasts.length}
                </motion.span>
                )
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Screen reader announcement for batch dismiss actions — provides
          clear feedback that all notifications were dismissed. Without this,
          screen reader users only hear individual toast removals without
          context that a batch dismiss occurred. */}
      <div className="sr-only" role="status" aria-live="assertive" aria-atomic="true">
        {dismissAnnouncement}
      </div>
    </motion.div>
  );
}

export const ToastContainer = memo(ToastContainerComponent);
