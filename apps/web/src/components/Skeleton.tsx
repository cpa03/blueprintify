/**
 * @fileoverview Skeleton loading components for placeholder content.
 *
 * This module provides various skeleton (placeholder) components for loading states:
 * - Text skeleton with configurable lines
 * - Circular skeleton for avatars/images
 * - Rectangular skeleton for generic content
 * - Card skeleton with header and content
 * - Avatar skeleton with size presets
 * - Button skeleton with size presets
 * - SkeletonGroup for grouping multiple skeletons
 * - SkeletonPatterns for decorative patterns
 *
 * Each variant supports:
 * - Shimmer and pulse animations
 * - Reduced motion preference
 * - Custom dimensions and styling
 * - Accessibility attributes
 *
 * @module components/Skeleton
 */

import { memo, forwardRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SKELETON_PRESETS } from "../config/constants";

interface SkeletonBaseProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  animation?: "shimmer" | "pulse" | "none";
  borderRadius?: number | string;
}

interface TextSkeletonProps extends SkeletonBaseProps {
  variant?: "text";
  lines?: number;
  lineSpacing?: number;
}

interface CircularSkeletonProps extends SkeletonBaseProps {
  variant: "circular";
}

interface RectangularSkeletonProps extends SkeletonBaseProps {
  variant: "rectangular";
}

interface CardSkeletonProps extends SkeletonBaseProps {
  variant: "card";
  showHeader?: boolean;
  showAvatar?: boolean;
  contentLines?: number;
}

interface AvatarSkeletonProps extends SkeletonBaseProps {
  variant: "avatar";
  size?: "sm" | "md" | "lg" | "xl";
}

interface ButtonSkeletonProps extends SkeletonBaseProps {
  variant: "button";
  size?: "sm" | "md" | "lg";
}

/**
 * Union type for all Skeleton component variants.
 */

type SkeletonProps =
  | TextSkeletonProps
  | CircularSkeletonProps
  | RectangularSkeletonProps
  | CardSkeletonProps
  | AvatarSkeletonProps
  | ButtonSkeletonProps;

const sizePresets = {
  avatar: {
    sm: SKELETON_PRESETS.AVATAR.SM,
    md: SKELETON_PRESETS.AVATAR.MD,
    lg: SKELETON_PRESETS.AVATAR.LG,
    xl: SKELETON_PRESETS.AVATAR.XL,
  },
  button: {
    sm: { height: SKELETON_PRESETS.BUTTON.SM.HEIGHT, width: SKELETON_PRESETS.BUTTON.SM.WIDTH },
    md: { height: SKELETON_PRESETS.BUTTON.MD.HEIGHT, width: SKELETON_PRESETS.BUTTON.MD.WIDTH },
    lg: { height: SKELETON_PRESETS.BUTTON.LG.HEIGHT, width: SKELETON_PRESETS.BUTTON.LG.WIDTH },
  },
} as const;

const shimmerVariants = {
  initial: { backgroundPosition: "200% 0" },
  animate: {
    backgroundPosition: "-200% 0",
    transition: {
      duration: SKELETON_PRESETS.SHIMMER_DURATION_S,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

const pulseVariants = {
  initial: { opacity: 1 },
  animate: {
    opacity: SKELETON_PRESETS.PULSE_OPACITY,
    transition: {
      duration: SKELETON_PRESETS.PULSE_DURATION_S,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut" as const,
    },
  },
};

const SkeletonElement = memo(
  forwardRef<HTMLDivElement, SkeletonBaseProps>(function SkeletonElement(
    { width, height, className = "", animation = "shimmer", borderRadius },
    ref
  ) {
    const prefersReducedMotion = useReducedMotion();
    const effectiveAnimation = prefersReducedMotion ? "none" : animation;

    const animationVariants = effectiveAnimation === "shimmer" ? shimmerVariants : pulseVariants;

    const style: React.CSSProperties = {
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    };

    return (
      <motion.div
        ref={ref}
        className={clsx(
          "skeleton-base",
          effectiveAnimation === "none" ? "skeleton-static" : "",
          className
        )}
        style={style}
        initial={effectiveAnimation === "none" ? undefined : "initial"}
        animate={effectiveAnimation === "none" ? undefined : "animate"}
        variants={effectiveAnimation === "none" ? undefined : animationVariants}
        aria-hidden="true"
      />
    );
  })
);

function TextSkeleton({
  width = "100%",
  height = SKELETON_PRESETS.TEXT.DEFAULT_HEIGHT,
  lines = 1,
  lineSpacing = SKELETON_PRESETS.TEXT.DEFAULT_LINE_SPACING,
  className = "",
  animation = "shimmer",
}: TextSkeletonProps) {
  if (lines === 1) {
    return (
      <SkeletonElement
        width={width}
        height={height}
        className={className}
        animation={animation}
        borderRadius={SKELETON_PRESETS.TEXT.BORDER_RADIUS}
      />
    );
  }

  return (
    <div className={clsx("flex flex-col", className)} role="status" aria-busy>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonElement
          key={index}
          width={index === lines - 1 ? SKELETON_PRESETS.LAST_LINE_WIDTH_PCT : width}
          height={height}
          animation={animation}
          borderRadius={SKELETON_PRESETS.TEXT.BORDER_RADIUS}
          className={index > 0 ? `mt-[${lineSpacing}px]` : ""}
        />
      ))}
    </div>
  );
}

function CircularSkeleton({
  width = SKELETON_PRESETS.CIRCULAR.DEFAULT_SIZE,
  height,
  className = "",
  animation = "shimmer",
}: CircularSkeletonProps) {
  const size = typeof width === "number" ? width : SKELETON_PRESETS.CIRCULAR.DEFAULT_SIZE;
  return (
    <SkeletonElement
      width={size}
      height={height ?? size}
      className={clsx("skeleton-circular", className)}
      animation={animation}
      borderRadius="50%"
    />
  );
}

function RectangularSkeleton({
  width = "100%",
  height = SKELETON_PRESETS.RECTANGULAR.DEFAULT_HEIGHT,
  className = "",
  animation = "shimmer",
  borderRadius = SKELETON_PRESETS.RECTANGULAR.DEFAULT_BORDER_RADIUS,
}: RectangularSkeletonProps) {
  return (
    <SkeletonElement
      width={width}
      height={height}
      className={className}
      animation={animation}
      borderRadius={borderRadius}
    />
  );
}

function CardSkeleton({
  width = "100%",
  height: _height,
  className = "",
  animation = "shimmer",
  showHeader = true,
  showAvatar = false,
  contentLines = 3,
}: CardSkeletonProps) {
  return (
    <div
      className={clsx("glass-card p-4 space-y-4", className)}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
      role="status"
      aria-busy
    >
      {showHeader && (
        <div className="flex items-center gap-3">
          {showAvatar && (
            <SkeletonElement
              width={SKELETON_PRESETS.CARD.AVATAR_SIZE}
              height={SKELETON_PRESETS.CARD.AVATAR_SIZE}
              animation={animation}
              borderRadius="50%"
            />
          )}
          <div className="flex-1 space-y-2">
            <SkeletonElement
              width="60%"
              height={SKELETON_PRESETS.CARD.TITLE_HEIGHT}
              animation={animation}
              borderRadius={SKELETON_PRESETS.TEXT.BORDER_RADIUS}
            />
            <SkeletonElement
              width="40%"
              height={SKELETON_PRESETS.CARD.SUBTITLE_HEIGHT}
              animation={animation}
              borderRadius={SKELETON_PRESETS.TEXT.BORDER_RADIUS}
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: contentLines }).map((_, index) => (
          <SkeletonElement
            key={index}
            width={index === contentLines - 1 ? SKELETON_PRESETS.CARD_LAST_LINE_WIDTH_PCT : "100%"}
            height={SKELETON_PRESETS.CARD.LINE_HEIGHT}
            animation={animation}
            borderRadius={SKELETON_PRESETS.TEXT.BORDER_RADIUS}
          />
        ))}
      </div>
    </div>
  );
}

function AvatarSkeleton({
  size = "md",
  className = "",
  animation = "shimmer",
}: AvatarSkeletonProps) {
  const dimension = sizePresets.avatar[size];
  return (
    <SkeletonElement
      width={dimension}
      height={dimension}
      className={clsx("skeleton-circular", className)}
      animation={animation}
      borderRadius="50%"
    />
  );
}

function ButtonSkeleton({
  size = "md",
  className = "",
  animation = "shimmer",
}: ButtonSkeletonProps) {
  const { height, width } = sizePresets.button[size];
  return (
    <SkeletonElement
      width={width}
      height={height}
      className={clsx("skeleton-button", className)}
      animation={animation}
      borderRadius={8}
    />
  );
}

/**
 * Main Skeleton component that renders different skeleton variants based on props.
 * Supports text, circular, rectangular, card, avatar, and button variants.
 *
 * @param props - Component props (variant determines which props are used)
 * @returns The rendered skeleton placeholder component
 *
 * @example
 * // Text skeleton with 3 lines
 * <Skeleton variant="text" lines={3} />
 *
 * @example
 * // Circular skeleton for avatar
 * <Skeleton variant="circular" width={48} height={48} />
 *
 * @example
 * // Card skeleton
 * <Skeleton variant="card" showHeader={true} contentLines={4} />
 *
 * @example
 * // Button skeleton
 * <Skeleton variant="button" size="lg" />
 */

function SkeletonComponent(props: SkeletonProps): JSX.Element {
  const variant = "variant" in props ? props.variant : "text";

  switch (variant) {
    case "circular":
      return <CircularSkeleton {...(props as CircularSkeletonProps)} />;
    case "rectangular":
      return <RectangularSkeleton {...(props as RectangularSkeletonProps)} />;
    case "card":
      return <CardSkeleton {...(props as CardSkeletonProps)} />;
    case "avatar":
      return <AvatarSkeleton {...(props as AvatarSkeletonProps)} />;
    case "button":
      return <ButtonSkeleton {...(props as ButtonSkeletonProps)} />;
    case "text":
    default:
      return <TextSkeleton {...(props as TextSkeletonProps)} />;
  }
}

export const Skeleton = memo(SkeletonComponent);

interface SkeletonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const SkeletonGroup = memo(function SkeletonGroup({
  children,
  className = "",
}: SkeletonGroupProps) {
  return (
    <div className={clsx("skeleton-group", className)} role="status" aria-busy>
      {children}
      <span className="sr-only">Loading content...</span>
    </div>
  );
});

export const SkeletonPatterns = {
  ListItem: memo(function ListItemSkeleton({
    showAvatar = true,
    lines = 2,
  }: {
    showAvatar?: boolean;
    lines?: number;
  }) {
    return (
      <div className="flex items-start gap-3 p-3">
        {showAvatar && <Skeleton variant="avatar" size="md" />}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} variant="text" width={i === lines - 1 ? "60%" : "100%"} height={12} />
          ))}
        </div>
      </div>
    );
  }),

  FormField: memo(function FormFieldSkeleton({ showLabel = true }: { showLabel?: boolean }) {
    return (
      <div className="space-y-2">
        {showLabel && <Skeleton variant="text" width={80} height={12} />}
        <Skeleton variant="rectangular" height={44} borderRadius={12} />
      </div>
    );
  }),

  CodeBlock: memo(function CodeBlockSkeleton({ lines = 8 }: { lines?: number }) {
    const widths = SKELETON_PRESETS.CODE_BLOCK_WIDTHS;
    return (
      <div className="glass-card p-4 space-y-2 font-mono">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${widths[i % widths.length]}%`} height={14} />
        ))}
      </div>
    );
  }),
};

export type {
  SkeletonProps,
  TextSkeletonProps,
  CircularSkeletonProps,
  RectangularSkeletonProps,
  CardSkeletonProps,
  AvatarSkeletonProps,
  ButtonSkeletonProps,
};

export default Skeleton;
