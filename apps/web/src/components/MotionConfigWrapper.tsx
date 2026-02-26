import { MotionConfig } from "framer-motion";
import { useReducedMotionContext } from "../context/ReducedMotionContext";
import { useEffect, ReactNode, memo } from "react";

interface MotionConfigWrapperProps {
  children: ReactNode;
  onMount?: () => void;
}

function MotionConfigWrapperComponent({
  children,
  onMount,
}: MotionConfigWrapperProps): JSX.Element {
  const { prefersReducedMotion } = useReducedMotionContext();

  useEffect(() => {
    onMount?.();
  }, [onMount]);

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}

export default memo(MotionConfigWrapperComponent);
