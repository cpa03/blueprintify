/**
 * Reusable SVG Icon Component
 *
 * Renders icons from the centralized ICONS configuration.
 * Flexy says: No hardcoded SVG path data in components - use this component!
 *
 * @example
 * ```tsx
 * <Icon name="check" className="w-5 h-5" />
 * <Icon name="close" ariaLabel="Close" />
 * ```
 */

import { type FC } from "react";
import { ICONS, type IconName } from "../config/icons";

interface IconProps {
  /** Icon name from centralized ICONS config */
  name: IconName;
  /** Tailwind classes for sizing (default: "w-5 h-5") */
  className?: string;
  /** Accessibility label (default: undefined = aria-hidden) */
  ariaLabel?: string;
  /** SVG stroke width (default: 2) */
  strokeWidth?: number;
}

export const Icon: FC<IconProps> = ({
  name,
  className = "w-5 h-5",
  ariaLabel,
  strokeWidth = 2,
}) => {
  const icon = ICONS[name];
  if (!icon) return null;

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox={icon.viewBox}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d={icon.path} />
    </svg>
  );
};

export type { IconName };
