import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore, type ToastType } from "../store/notifications";

const toastStyles: Record<ToastType, string> = {
  success: "bg-accent-emerald/20 border-accent-emerald/50 text-accent-emerald",
  error: "bg-accent-pink/20 border-accent-pink/50 text-accent-pink",
  warning: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  info: "bg-primary-500/20 border-primary-500/50 text-primary-300",
};

const toastIcons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export function ToastContainer() {
  const { toasts, removeToast } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm min-w-[280px] max-w-md shadow-lg ${toastStyles[toast.type]}`}
            role="alert"
            aria-live="polite"
          >
            <span className="text-lg font-bold" aria-hidden="true">
              {toastIcons[toast.type]}
            </span>
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-60 hover:opacity-100 transition-opacity"
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
