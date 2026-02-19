export {
  useReducedMotion,
  useAccessibleAnimation,
  useAccessibilityPreferences,
  getAnimationDuration,
  getSpringConfig,
} from "./useReducedMotion";
export type {
  ReducedMotionContextType,
  ReducedMotionProviderProps,
} from "../context/ReducedMotionContext";
export {
  ReducedMotionProvider,
  useReducedMotionContext,
  ReducedMotionContext,
} from "../context/ReducedMotionContext";
export { useLastSaved } from "./useLastSaved";
export type { UseLastSavedReturn } from "./useLastSaved";
export { useFocusTrap } from "./useFocusTrap";
export type { UseFocusTrapOptions, UseFocusTrapReturn } from "./useFocusTrap";
export { useAutoResizeTextarea } from "./useAutoResizeTextarea";
export type {
  UseAutoResizeTextareaOptions,
  UseAutoResizeTextareaReturn,
} from "./useAutoResizeTextarea";
