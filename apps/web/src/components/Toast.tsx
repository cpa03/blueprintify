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
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { ANIMATION_SCALE, ANIMATION_OPACITY, ANIMATION_Y_OFFSET } from "@blueprint/shared";
import { useToastStore, type ToastType, type Toast } from "../store/toast";
import {
  TOAST_CONFIG,
  SPRING_CONFIG,
  HOVER_SCALE,
  TAP_SCALE,
  ROTATION,
  ACCESSIBILITY_LABELS,
  ANIMATION,
  EASING,
  TOOLTIP_CONFIG,
  TOAST_DISPLAY,
  FOCUS_ANNOUNCER,
} from "../config/constants";
import { TOAST_SPRING, TRANSFORMS } from "../config/theme";
import {
  ANIMATION_ENTRANCE_DELAYS,
  ARIA_ATOMIC_VALUES,
  ARIA_HIDDEN_VALUES,
  ARIA_LIVE_VALUES,
  ARIA_MODAL_VALUES,
  ARIA_ROLES,
  BANNER_STATE_VALUES,
  FRAMER_TYPE,
  KEYBOARD_EVENT_KEYS,
  PERCENT_SCALE,
  SHORTCUT_LABELS,
  TIME_UNITS,
  TOAST_TYPES,
  UI_TIMEOUTS,
} from "@blueprint/shared/config";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Icon } from "./Icon";
import { SmartTooltip } from "./SmartTooltip";
import {
  SVG_ICON_DEFAULTS,
  COLOR_MIX_OPACITY,
  ICON_RECTS,
  CIRCLE_GEOMETRY,
} from "@blueprint/shared/config";

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
  /** When true, removes the CSS transition on stroke-dashoffset so the ring
   *  updates instantly rather than smoothly. Used when prefers-reduced-motion
   *  is active, since frame-by-frame progress animation is unnecessary motion
   *  that could cause discomfort for vestibular disorder users. */
  noTransition?: boolean;
}

const ProgressRing = memo(function ProgressRing({
  progress,
  size = TOAST_SPRING.PROGRESS_RING.SIZE_PX,
  strokeWidth = TOAST_SPRING.PROGRESS_RING.STROKE_WIDTH,
  color = SVG_ICON_DEFAULTS.STROKE_CURRENT,
  noTransition = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * CIRCLE_GEOMETRY.FULL_TURN_RAD;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="absolute pointer-events-none"
      style={{ transform: TRANSFORMS.ROTATE_NEG_90 }}
      aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill={SVG_ICON_DEFAULTS.FILL_NONE}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={0.15}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill={SVG_ICON_DEFAULTS.FILL_NONE}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{
          transition: noTransition ? "none" : TOAST_SPRING.PROGRESS_RING_TRANSITION,
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
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
        const initialProgress = Math.round(
          (remaining / originalDurationRef.current) * PERCENT_SCALE
        );
        setProgress(initialProgress);

        if (!shouldReduceMotion) {
          // Full motion: smooth rAF-driven progress animation that gives a
          // polished countdown visual. Only runs when the user has not requested
          // reduced motion, since frame-by-frame animation is unnecessary visual
          // motion that can cause discomfort for vestibular disorder users.
          const animateProgress = () => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.max(0, initialProgress * (1 - elapsed / remaining));
            setProgress(newProgress);

            if (newProgress > 0 && !isHovered) {
              rafRef.current = requestAnimationFrame(animateProgress);
            }
          };
          rafRef.current = requestAnimationFrame(animateProgress);
        } else {
          // Reduced motion: no rAF loop, but the countdown must not freeze at
          // its starting value — a ring that sits at 100% and then vanishes
          // gives users no "time remaining" cue before auto-dismiss. A coarse
          // stepped countdown (one state update per REDUCED_MOTION_PROGRESS_STEP_MS)
          // restores that informational signal without continuous frame-by-frame
          // motion; the CSS transitions on the ring/bar are already disabled
          // under reduced motion, so each tick lands as a discrete jump.
          const tickProgress = () => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.max(
              0,
              Math.round(initialProgress * (1 - elapsed / remaining))
            );
            setProgress(newProgress);

            if (newProgress <= 0 && intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          };
          intervalRef.current = setInterval(
            tickProgress,
            TOAST_CONFIG.REDUCED_MOTION_PROGRESS_STEP_MS
          );
        }

        timeoutRef.current = setTimeout(() => {
          onRemove(toast.id);
        }, remaining);
      },
      [toast.id, onRemove, isHovered, clearToastTimeout, shouldReduceMotion]
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
      type: FRAMER_TYPE.SPRING,
      ...SPRING_CONFIG.DEFAULT,
      delay: staggerIndex * (TOAST_STAGGER_MS / TIME_UNITS.MS_PER_SECOND),
    };

    const reducedTransition = {
      duration: ANIMATION.NORMAL,
      delay: staggerIndex * (TOAST_STAGGER_MS / TIME_UNITS.MS_PER_SECOND),
      ease: EASING.easeOut,
    };

    // For error/warning toasts, use role="alert" so screen readers announce
    // them immediately. Success/info toasts keep role="status" with polite
    // announcements — advisory information that isn't time-sensitive.
    // Custom ariaLabel (e.g., for pro tips) overrides the default role/announcement.
    const isAlert = toast.type === TOAST_TYPES.ERROR || toast.type === TOAST_TYPES.WARNING;
    const toastRole = toast.ariaLabel ? "status" : isAlert ? "alert" : "status";
    const toastAriaLive = toast.ariaLabel ? "polite" : isAlert ? "assertive" : "polite";

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
              initial: {
                opacity: 0,
                y: ANIMATION_Y_OFFSET.DROP_LARGE,
                scale: ANIMATION_SCALE.MODAL,
              },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: ANIMATION_Y_OFFSET.RISE_LARGE, scale: ANIMATION_SCALE.MODAL },
              transition: defaultTransition,
            })}
        className={`pointer-events-auto px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg flex items-center gap-3 min-w-70 max-w-md relative overflow-hidden group ${toastStyles[toast.type]}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        role={toastRole}
        aria-live={toastAriaLive}
        aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
        aria-label={toast.ariaLabel}
        data-toast-type={toast.type}
        data-hovered={isHovered ? "true" : "false"}
        data-is-alert={isAlert ? "true" : "false"}
        data-state={BANNER_STATE_VALUES.VISIBLE}
        data-progress={Math.round(progress)}
        data-reduced-motion={shouldReduceMotion ? "true" : "false"}
      >
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30"
          style={{
            width: `${progress}%`,
            opacity: isHovered ? 0 : 0.3,
            // Match ProgressRing's noTransition behavior above (WCAG 2.3.3):
            // the width countdown is decorative motion, so snap instantly
            // when the user prefers reduced motion.
            transition: shouldReduceMotion ? "none" : TOAST_SPRING.PROGRESS_BAR_TRANSITION,
          }}
          aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
        />

        {/* Entry glow ring — brief initial glow that fades out after the toast
            enters, giving notifications a subtle "pop" as they appear. Uses
            currentColor so the glow matches the toast type (success green,
            error red, warning amber, info blue). Skipped when reduced motion
            is preferred to avoid unnecessary visual noise. */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: ANIMATION.SLOW, ease: EASING.easeOut }}
            style={{
              boxShadow: `inset 0 0 40px 0 color-mix(in srgb, ${SVG_ICON_DEFAULTS.STROKE_CURRENT} ${COLOR_MIX_OPACITY.GLOW}, transparent)`,
            }}
            aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
          />
        )}

        {/* Hover glow ring — subtle inset glow that gently "catches" the toast
            when paused, reinforcing the paused state visually. Uses currentColor
            which inherits from the toast type (success/error/warning/info), so
            the glow color always matches naturally. */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovered ? 1 : 0,
            boxShadow: `inset 0 0 24px 0 color-mix(in srgb, ${SVG_ICON_DEFAULTS.STROKE_CURRENT} ${COLOR_MIX_OPACITY.SUBTLE}, transparent)`,
          }}
          aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
        />

        {shouldReduceMotion ? (
          isHovered && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 bg-current/20 rounded-full flex items-center justify-center"
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
            >
              <svg
                className="w-2.5 h-2.5"
                fill={SVG_ICON_DEFAULTS.FILL_CURRENT}
                viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              >
                <rect {...ICON_RECTS.PAUSE_LEFT} />
                <rect {...ICON_RECTS.PAUSE_RIGHT} />
              </svg>
            </div>
          )
        ) : (
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: ANIMATION_SCALE.POP_IN,
                  y: ANIMATION_Y_OFFSET.DROP_SMALL,
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: ANIMATION_SCALE.POP_IN,
                  y: ANIMATION_Y_OFFSET.DROP_SMALL,
                }}
                transition={{ type: FRAMER_TYPE.SPRING, ...TOAST_SPRING.WARNING_ICON }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-current/20 rounded-full flex items-center justify-center"
                aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              >
                <svg
                  className="w-2.5 h-2.5"
                  fill={SVG_ICON_DEFAULTS.FILL_CURRENT}
                  viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                  aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                >
                  <rect {...ICON_RECTS.PAUSE_LEFT} />
                  <rect {...ICON_RECTS.PAUSE_RIGHT} />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <span className="relative flex-shrink-0 w-7 h-7 flex items-center justify-center">
          <ProgressRing
            progress={progress}
            size={28}
            strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
            noTransition={shouldReduceMotion}
          />
          {shouldReduceMotion ? (
            <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center font-bold text-sm relative z-10">
              {toastIcons[toast.type]}
            </span>
          ) : (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: FRAMER_TYPE.SPRING,
                ...TOAST_SPRING.CHECKMARK,
                delay: ANIMATION_ENTRANCE_DELAYS.VERY_MODERATE,
              }}
              className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center font-bold text-sm relative z-10"
            >
              {toastIcons[toast.type]}
            </motion.span>
          )}
        </span>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-xs font-semibold text-current/80 mb-0.5 tracking-wider uppercase">
              {toast.title}
            </p>
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        {shouldReduceMotion ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: ANIMATION.NORMAL, ease: EASING.easeOut }}
            className="inline-flex"
          >
            <SmartTooltip
              content={ACCESSIBILITY_LABELS.TOAST.DISMISS(toast.type)}
              position="left"
              delay={TOOLTIP_CONFIG.DEFAULT_SHOW_DELAY}
            >
              <button
                type="button"
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/50 rounded p-1 transition-colors"
                aria-label={ACCESSIBILITY_LABELS.TOAST.DISMISS(toast.type)}
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </SmartTooltip>
          </motion.span>
        ) : (
          <SmartTooltip
            content={ACCESSIBILITY_LABELS.TOAST.DISMISS(toast.type)}
            position="left"
            delay={TOOLTIP_CONFIG.DEFAULT_SHOW_DELAY}
          >
            <motion.button
              type="button"
              onClick={() => onRemove(toast.id)}
              className="flex-shrink-0 hover:opacity-100 hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/50 rounded p-1 transition-colors"
              aria-label={ACCESSIBILITY_LABELS.TOAST.DISMISS(toast.type)}
              initial={{ opacity: 0, scale: ANIMATION_SCALE.POP_IN }}
              animate={{ opacity: ANIMATION_OPACITY.FADED, scale: 1 }}
              transition={{
                opacity: {
                  duration: ANIMATION.NORMAL,
                  ease: EASING.easeOut,
                  delay: ANIMATION_ENTRANCE_DELAYS.MODERATE,
                },
                scale: {
                  type: FRAMER_TYPE.SPRING,
                  ...TOAST_SPRING.DISMISS_BUTTON,
                  delay: ANIMATION_ENTRANCE_DELAYS.MODERATE,
                },
              }}
              whileHover={{ ...HOVER_SCALE.EXTRA, ...ROTATION.QUARTER }}
              whileTap={TAP_SCALE.STRONG}
            >
              <Icon name="close" className="w-4 h-4" />
            </motion.button>
          </SmartTooltip>
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

  // Wrapped remove function that also announces the dismissal to screen readers.
  // Without this, screen reader users hear the toast content when it appears
  // (via role="alert"/"status") but get no feedback when it's dismissed —
  // the removal from the DOM is silent. This fills that gap so SR users
  // always know the notification was explicitly dismissed.
  const handleRemoveToast = useCallback(
    (id: string) => {
      const toast = toasts.find((t) => t.id === id);
      if (toast) {
        setDismissAnnouncement(
          ACCESSIBILITY_LABELS.TOAST_ANNOUNCER.DISMISSED_SINGLE(toast.message)
        );
      }
      removeToast(id);
    },
    [removeToast, toasts]
  );

  // Dismiss the most recent toast (Escape) or all toasts (Shift+Escape).
  useEffect(() => {
    if (toasts.length === 0) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_EVENT_KEYS.ESCAPE) {
        // While a modal dialog is open (ConfirmDialog, KeyboardShortcutsModal),
        // Escape belongs exclusively to the modal. Without this guard the same
        // keypress would both close the dialog and silently dismiss an
        // underlying toast the user never targeted — a surprising loss of a
        // notification mid-interaction.
        if (
          document.querySelector(
            `[role="${ARIA_ROLES.DIALOG}"][aria-modal="${ARIA_MODAL_VALUES.TRUE}"]`
          )
        ) {
          return;
        }
        e.preventDefault();
        if (e.shiftKey) {
          const count = toasts.length;
          clearAll();
          setDismissAnnouncement(ACCESSIBILITY_LABELS.TOAST_ANNOUNCER.DISMISSED_ALL(count));
        } else {
          const lastToast = toasts[toasts.length - 1];
          if (lastToast) {
            handleRemoveToast(lastToast.id);
          }
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [toasts, removeToast, clearAll, handleRemoveToast]);

  const handleClearAll = useCallback(() => {
    const count = toasts.length;
    clearAll();
    setDismissAnnouncement(ACCESSIBILITY_LABELS.TOAST_ANNOUNCER.DISMISSED_ALL(count));
  }, [clearAll, toasts.length]);

  // Clear the dismiss announcement after screen readers have had time to
  // announce it. A short timeout prevents the sr-only region from accumulating
  // stale text that would be re-announced on subsequent dismiss-all actions.
  useEffect(() => {
    if (!dismissAnnouncement) return;
    const timer = setTimeout(
      () => setDismissAnnouncement(""),
      UI_TIMEOUTS.DISMISS_ANNOUNCEMENT_CLEAR
    );
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
        initial: { opacity: 0, y: ANIMATION_Y_OFFSET.DROP_MODERATE },
        animate: { opacity: 1, y: 0 },
        transition: { type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SNAPPY },
      };

  return (
    <motion.div
      className={TOAST_SPRING.CONTAINER_CLASSES}
      role={ARIA_ROLES.REGION}
      aria-label={ACCESSIBILITY_LABELS.TOAST.REGION}
      data-count={toasts.length}
      data-has-toasts={toasts.length > 0 ? "true" : "false"}
      data-state={toasts.length > 0 ? BANNER_STATE_VALUES.VISIBLE : BANNER_STATE_VALUES.HIDDEN}
      data-reduced-motion={shouldReduceMotion ? "true" : "false"}
      {...containerAnimation}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={handleRemoveToast}
            staggerIndex={index}
          />
        ))}
      </AnimatePresence>

      {shouldReduceMotion ? (
        showDismissAll && (
          <button
            type="button"
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
              <Icon name="close" className="w-3.5 h-3.5" />
              {TOAST_DISPLAY.DISMISS_ALL_PREFIX}
              <span className="tabular-nums" aria-hidden={ARIA_HIDDEN_VALUES.TRUE}>
                {toasts.length}
              </span>
              {TOAST_DISPLAY.DISMISS_ALL_SUFFIX}
              <kbd
                className="ml-1.5 px-1 py-0.5 bg-dark-700/50 rounded text-2xs font-mono text-dark-500 border border-dark-600/30 leading-none"
                aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              >
                {SHORTCUT_LABELS.TOAST_DISMISS_ALL}
              </kbd>
            </span>
          </button>
        )
      ) : (
        <AnimatePresence>
          {showDismissAll && (
            <motion.button
              type="button"
              initial={{
                opacity: 0,
                y: ANIMATION_Y_OFFSET.RISE_SUBTLE,
                scale: ANIMATION_SCALE.MODAL,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_SUBTLE, scale: ANIMATION_SCALE.MODAL }}
              transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SNAPPY }}
              whileHover={HOVER_SCALE.GENTLE}
              whileTap={TAP_SCALE.GENTLE}
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
                <Icon name="close" className="w-3.5 h-3.5" />
                {TOAST_DISPLAY.DISMISS_ALL_PREFIX}
                <motion.span
                  key={toasts.length}
                  className="tabular-nums"
                  initial={{ scale: ANIMATION_SCALE.POP_IN, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.COUNTER_FLIP }}
                  aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                >
                  {toasts.length}
                </motion.span>
                {TOAST_DISPLAY.DISMISS_ALL_SUFFIX}
                <kbd
                  className="ml-1.5 px-1 py-0.5 bg-dark-700/50 rounded text-2xs font-mono text-dark-500 border border-dark-600/30 leading-none"
                  aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                >
                  {SHORTCUT_LABELS.TOAST_DISMISS_ALL}
                </kbd>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Screen reader announcement for batch dismiss actions — provides
          clear feedback that all notifications were dismissed. Without this,
          screen reader users only hear individual toast removals without
          context that a batch dismiss occurred. */}
      <div
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role={ARIA_ROLES.STATUS}
        aria-live={ARIA_LIVE_VALUES.ASSERTIVE}
        aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
      >
        {dismissAnnouncement}
      </div>
    </motion.div>
  );
}

export const ToastContainer = memo(ToastContainerComponent);
