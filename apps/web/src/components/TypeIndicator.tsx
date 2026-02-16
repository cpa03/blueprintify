import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypeIndicatorProps {
  isTyping: boolean;
  position?: "left" | "right";
  className?: string;
}

export function TypeIndicator({
  isTyping,
  position = "right",
  className = "",
}: TypeIndicatorProps) {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`inline-flex items-center gap-1 ${
            position === "left" ? "mr-2" : "ml-2"
          } ${className}`}
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="sr-only">Typing</span>
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="w-1.5 h-1.5 rounded-full bg-primary-400"
              animate={{
                y: [0, -4, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface UseTypingIndicatorOptions {
  delay?: number;
  minInputLength?: number;
}

export function useTypingIndicator(options: UseTypingIndicatorOptions = {}) {
  const { delay = 800, minInputLength = 0 } = options;
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValueRef = useRef<string>("");

  const handleTyping = useCallback(
    (value: string) => {
      if (value.length >= minInputLength && value !== lastValueRef.current) {
        setIsTyping(true);
        lastValueRef.current = value;

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, delay);
      }
    },
    [delay, minInputLength],
  );

  const handleBlur = useCallback(() => {
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    handleTyping,
    handleBlur,
  };
}

export default TypeIndicator;
