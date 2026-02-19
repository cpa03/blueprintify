import { motion, AnimatePresence } from "framer-motion";
import { useToastStore, type ToastType } from "../store/toast";
import { TOAST_CONFIG, SPRING_CONFIG } from "../config/constants";

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

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", ...SPRING_CONFIG.DEFAULT }}
            className={`pointer-events-auto px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg flex items-center gap-3 min-w-[280px] max-w-md ${toastStyles[toast.type]}`}
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-current/20 flex items-center justify-center font-bold text-sm">
              {toastIcons[toast.type]}
            </span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
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
        ))}
      </AnimatePresence>
    </div>
  );
}
