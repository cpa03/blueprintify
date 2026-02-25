import {
  useState,
  useRef,
  useCallback,
  forwardRef,
  memo,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { motion } from "framer-motion";
import { TypeIndicator, useTypingIndicator } from "./TypeIndicator";
import { SPRING_CONFIG, ANIMATION_MS } from "../config/constants";

interface AnimatedInputBaseProps {
  label?: string;
  showTypingIndicator?: boolean;
  typingDelay?: number;
  error?: string;
  hint?: string;
  validationState?: "default" | "valid" | "invalid" | "warning";
}

type AnimatedInputProps = AnimatedInputBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof AnimatedInputBaseProps>;

type AnimatedTextareaProps = AnimatedInputBaseProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    keyof AnimatedInputBaseProps
  >;

const getValidationStyles = (
  state: AnimatedInputBaseProps["validationState"],
) => {
  switch (state) {
    case "valid":
      return "border-accent-emerald/50 focus:border-accent-emerald focus:ring-accent-emerald/20";
    case "invalid":
      return "border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20";
    case "warning":
      return "border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-500/20";
    default:
      return "border-dark-700 focus:border-primary-500/50 focus:ring-primary-500/20";
  }
};

export const AnimatedInput = memo(
  forwardRef<HTMLInputElement, AnimatedInputProps>(function AnimatedInput(
    {
      label,
      showTypingIndicator = true,
      typingDelay = ANIMATION_MS.INPUT_TYPING_DELAY,
      error,
      hint,
      validationState = "default",
      className = "",
      onChange,
      onBlur,
      onFocus,
      value,
      ...props
    },
    ref,
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const {
      isTyping,
      handleTyping,
      handleBlur: handleTypingBlur,
    } = useTypingIndicator({
      delay: typingDelay,
      minInputLength: 1,
    });

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleTyping(e.target.value);
        onChange?.(e);
      },
      [handleTyping, onChange],
    );

    const handleFocusEvent = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlurEvent = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        handleTypingBlur();
        onBlur?.(e);
      },
      [handleTypingBlur, onBlur],
    );

    const combinedRef = useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
          node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref],
    );

    return (
      <div className="relative">
        {label && (
          <label className="label flex items-center gap-2 mb-2">
            {label}
            {showTypingIndicator && isFocused && (
              <TypeIndicator isTyping={isTyping} />
            )}
          </label>
        )}
        <motion.div
          className="relative"
          animate={
            isFocused
              ? {
                  scale: 1.005,
                }
              : {
                  scale: 1,
                }
          }
          transition={{ type: "spring", ...SPRING_CONFIG.SNAPPY }}
        >
          <input
            ref={combinedRef}
            className={`w-full px-4 py-3 bg-dark-800/50 rounded-xl text-white placeholder-dark-500
              focus-visible:outline-none focus-visible:ring-2 transition-all duration-200
              ${getValidationStyles(validationState)}
              ${className}`}
            onChange={handleChange}
            onFocus={handleFocusEvent}
            onBlur={handleBlurEvent}
            value={value}
            {...props}
          />
          {validationState === "valid" && !isFocused && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="w-6 h-6 rounded-full bg-accent-emerald/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-accent-emerald"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </motion.div>
          )}
        </motion.div>
        {error && (
          <p role="alert" className="text-xs text-accent-pink mt-1">
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-dark-500 mt-1">{hint}</p>}
      </div>
    );
  }),
);

export const AnimatedTextarea = memo(
  forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
    function AnimatedTextarea(
      {
        label,
        showTypingIndicator = true,
        typingDelay = ANIMATION_MS.INPUT_TYPING_DELAY,
        error,
        hint,
        validationState = "default",
        className = "",
        onChange,
        onBlur,
        onFocus,
        value,
        rows = 4,
        ...props
      },
      ref,
    ) {
      const [isFocused, setIsFocused] = useState(false);
      const textareaRef = useRef<HTMLTextAreaElement>(null);
      const {
        isTyping,
        handleTyping,
        handleBlur: handleTypingBlur,
      } = useTypingIndicator({
        delay: typingDelay,
        minInputLength: 1,
      });

      const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          handleTyping(e.target.value);
          onChange?.(e);
        },
        [handleTyping, onChange],
      );

      const handleFocusEvent = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
          setIsFocused(true);
          onFocus?.(e);
        },
        [onFocus],
      );

      const handleBlurEvent = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
          setIsFocused(false);
          handleTypingBlur();
          onBlur?.(e);
        },
        [handleTypingBlur, onBlur],
      );

      const combinedRef = useCallback(
        (node: HTMLTextAreaElement | null) => {
          (
            textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
          ).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (
              ref as React.MutableRefObject<HTMLTextAreaElement | null>
            ).current = node;
          }
        },
        [ref],
      );

      return (
        <div className="relative">
          {label && (
            <label className="label flex items-center gap-2 mb-2">
              {label}
              {showTypingIndicator && isFocused && (
                <TypeIndicator isTyping={isTyping} />
              )}
            </label>
          )}
          <motion.div
            className="relative"
            animate={
              isFocused
                ? {
                    scale: 1.005,
                  }
                : {
                    scale: 1,
                  }
            }
            transition={{ type: "spring", ...SPRING_CONFIG.SNAPPY }}
          >
            <textarea
              ref={combinedRef}
              rows={rows}
              className={`w-full px-4 py-3 bg-dark-800/50 rounded-xl text-white placeholder-dark-500 resize-none
              focus-visible:outline-none focus-visible:ring-2 transition-all duration-200
              ${getValidationStyles(validationState)}
              ${className}`}
              onChange={handleChange}
              onFocus={handleFocusEvent}
              onBlur={handleBlurEvent}
              value={value}
              {...props}
            />
            {validationState === "valid" && !isFocused && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-3 top-3 pointer-events-none"
              >
                <div className="w-6 h-6 rounded-full bg-accent-emerald/20 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-accent-emerald"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </motion.div>
          {error && (
            <p role="alert" className="text-xs text-accent-pink mt-1">
              {error}
            </p>
          )}
          {hint && !error && (
            <p className="text-xs text-dark-500 mt-1">{hint}</p>
          )}
        </div>
      );
    },
  ),
);

export default AnimatedInput;
