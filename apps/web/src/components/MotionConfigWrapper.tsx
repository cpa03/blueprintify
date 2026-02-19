import { MotionConfig } from "framer-motion";
import { useReducedMotionContext } from "../context/ReducedMotionContext";
import { useEffect, ReactNode } from "react";

interface MotionConfigWrapperProps {
  children: ReactNode;
  onMount?: () => void;
}

export default function MotionConfigWrapper({
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
