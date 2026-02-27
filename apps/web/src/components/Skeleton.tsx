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
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  },
  button: {
    sm: { height: 32, width: 80 },
    md: { height: 40, width: 120 },
    lg: { height: 48, width: 160 },
  },
} as const;

const shimmerVariants = {
  initial: { backgroundPosition: "200% 0" },
  animate: {
    backgroundPosition: "-200% 0",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

const pulseVariants = {
  initial: { opacity: 1 },
  animate: {
    opacity: 0.5,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
    },
  },
};

const SkeletonElement = memo(
  forwardRef<HTMLDivElement, SkeletonBaseProps>(function SkeletonElement(
    { width, height, className = "", animation = "shimmer", borderRadius },
    ref,
  ) {
    const prefersReducedMotion = useReducedMotion();
    const effectiveAnimation = prefersReducedMotion ? "none" : animation;

    const animationVariants =
      effectiveAnimation === "shimmer" ? shimmerVariants : pulseVariants;

    const style: React.CSSProperties = {
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      borderRadius:
        typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    };

    return (
      <motion.div
        ref={ref}
        className={clsx(
          "skeleton-base",
          effectiveAnimation === "none" ? "skeleton-static" : "",
          className,
        )}
        style={style}
        initial={effectiveAnimation === "none" ? undefined : "initial"}
        animate={effectiveAnimation === "none" ? undefined : "animate"}
        variants={effectiveAnimation === "none" ? undefined : animationVariants}
        aria-hidden="true"
      />
    );
  }),
);

function TextSkeleton({
  width = "100%",
  height = 14,
  lines = 1,
  lineSpacing = 8,
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
        borderRadius={4}
      />
    );
  }

  return (
    <div className={clsx("flex flex-col", className)} role="status" aria-busy>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonElement
          key={index}
          width={index === lines - 1 ? "70%" : width}
          height={height}
          animation={animation}
          borderRadius={4}
          className={index > 0 ? `mt-[${lineSpacing}px]` : ""}
        />
      ))}
    </div>
  );
}

function CircularSkeleton({
  width = 40,
  height,
  className = "",
  animation = "shimmer",
}: CircularSkeletonProps) {
  const size = typeof width === "number" ? width : 40;
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
  height = 100,
  className = "",
  animation = "shimmer",
  borderRadius = 8,
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
              width={40}
              height={40}
              animation={animation}
              borderRadius="50%"
            />
          )}
          <div className="flex-1 space-y-2">
            <SkeletonElement
              width="60%"
              height={14}
              animation={animation}
              borderRadius={4}
            />
            <SkeletonElement
              width="40%"
              height={12}
              animation={animation}
              borderRadius={4}
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: contentLines }).map((_, index) => (
          <SkeletonElement
            key={index}
            width={index === contentLines - 1 ? "75%" : "100%"}
            height={12}
            animation={animation}
            borderRadius={4}
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
            <Skeleton
              key={i}
              variant="text"
              width={i === lines - 1 ? "60%" : "100%"}
              height={12}
            />
          ))}
        </div>
      </div>
    );
  }),

  FormField: memo(function FormFieldSkeleton({
    showLabel = true,
  }: {
    showLabel?: boolean;
  }) {
    return (
      <div className="space-y-2">
        {showLabel && <Skeleton variant="text" width={80} height={12} />}
        <Skeleton variant="rectangular" height={44} borderRadius={12} />
      </div>
    );
  }),

  CodeBlock: memo(function CodeBlockSkeleton({
    lines = 8,
  }: {
    lines?: number;
  }) {
    const widths = [75, 85, 65, 90, 70, 80, 60, 95];
    return (
      <div className="glass-card p-4 space-y-2 font-mono">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={`${widths[i % widths.length]}%`}
            height={14}
          />
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
