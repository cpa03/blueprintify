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

import { memo } from "react";
import { SVG_ICON_DEFAULTS } from "@blueprint/shared/config";
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

const Icon = memo(function Icon({
  name,
  className = SVG_ICON_DEFAULTS.SIZE_DEFAULT,
  ariaLabel,
  strokeWidth = SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT,
}: IconProps) {
  const icon = ICONS[name];
  if (!icon) return null;

  return (
    <svg
      className={className}
      fill={SVG_ICON_DEFAULTS.FILL_NONE}
      stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
      viewBox={icon.viewBox}
      role={ariaLabel ? "img" : undefined}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path
        strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
        strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
        strokeWidth={strokeWidth}
        d={icon.path}
      />
    </svg>
  );
});

export { Icon };
export type { IconName };
