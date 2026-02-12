import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore, type ToastType, type Toast } from "../store/toast";
import { TOAST_CONFIG } from "../config/constants";

const toastIcons: Record<ToastType, string> = {
  success: TOAST_CONFIG.ICONS.SUCCESS,
  error: TOAST_CONFIG.ICONS.ERROR,
  warning: TOAST_CONFIG.ICONS.WARNING,
  info: TOAST_CONFIG.ICONS.INFO,
};

const toastStyles: Record<ToastType, string> = {
  success: TOAST_CONFIG.STYLES.SUCCESS,
  error: TOAST_CONFIG.STYLES.ERROR,
  warning: TOAST_CONFIG.STYLES.WARNING,
  info: TOAST_CONFIG.STYLES.INFO,
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef<number>(
    toast.duration ?? TOAST_CONFIG.DEFAULT_DURATION,
  );
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(
    toast.duration ?? TOAST_CONFIG.DEFAULT_DURATION,
  );
  const rafRef = useRef<number | null>(null);

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

      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.max(0, 100 - (elapsed / remaining) * 100);
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
    [toast.id, onRemove, isHovered, clearToastTimeout],
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`pointer-events-auto px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg flex items-center gap-3 min-w-[280px] max-w-md relative overflow-hidden group ${toastStyles[toast.type]}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      role="alert"
      aria-live="polite"
    >
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 transition-none"
        style={{
          width: `${progress}%`,
          opacity: isHovered ? 0 : 0.3,
        }}
      />

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-current/20 rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-[10px]">⏸</span>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-current/20 flex items-center justify-center font-bold text-sm">
        {toastIcons[toast.type]}
      </span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-current/50 rounded p-1"
        aria-label="Dismiss notification"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
