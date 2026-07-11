/**
 * @fileoverview Celebration animation component displayed when blueprint generation completes.
 *
 * This component provides a celebratory animation with:
 * - Particle explosion effect (circles, squares, stars)
 * - Checkmark animation indicating completion
 * - Accessibility support with ARIA labels
 * - Reduced motion support for users who prefer less animation
 *
 * @module components/GenerationCelebration
 */

import { useEffect, useState, memo } from "react";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  CELEBRATION_COLORS,
  CELEBRATION_TIMING,
  CELEBRATION_PARTICLE,
  CELEBRATION_TEXT,
  CELEBRATION_PARTICLE_STYLE,
  SPRING_CONFIG,
} from "../config/constants";
import { FRAMER_TYPE } from "@blueprint/shared/config";
import { CELEBRATION_ANIMATION } from "../config/theme";
import { ACCESSIBILITY_LABELS } from "../config/constants/content";

const { CIRCLE_REVEAL_DURATION_S, CHECKMARK_PATH_DELAY_S, TEXT_DELAY_S } = CELEBRATION_ANIMATION;

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  rotation: number;
  shape: "circle" | "square" | "star";
}

/**
 * Props for the GenerationCelebration component.
 */

interface GenerationCelebrationProps {
  isComplete: boolean;
  onComplete?: () => void;
}

function generateParticles(centerX: number, centerY: number): Particle[] {
  const particleShapes: Particle["shape"][] = [...CELEBRATION_PARTICLE.SHAPES];
  const particles: Particle[] = [];

  for (let i = 0; i < CELEBRATION_PARTICLE.COUNT; i++) {
    const angle = (i / CELEBRATION_PARTICLE.COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const distance =
      CELEBRATION_PARTICLE.BASE_DISTANCE_PX +
      Math.random() * CELEBRATION_PARTICLE.RANDOM_DISTANCE_PX;
    const color = CELEBRATION_COLORS[i % CELEBRATION_COLORS.length]!;
    const size =
      CELEBRATION_PARTICLE.BASE_SIZE_PX + Math.random() * CELEBRATION_PARTICLE.RANDOM_SIZE_PX;
    const rotation = Math.random() * 360;
    const shape = particleShapes[i % particleShapes.length]!;

    particles.push({
      id: i,
      x: centerX,
      y: centerY,
      angle,
      distance,
      color,
      size,
      rotation,
      shape,
    });
  }

  return particles;
}

interface ParticleShapeProps {
  shape: Particle["shape"];
  size: number;
  color: string;
}

const ParticleShape = memo(function ParticleShape({
  shape,
  size,
  color,
}: ParticleShapeProps): JSX.Element {
  if (shape === "circle") {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: CELEBRATION_PARTICLE_STYLE.CIRCLE_RADIUS,
          boxShadow: CELEBRATION_PARTICLE_STYLE.BOX_SHADOW_TEMPLATE(size, color),
        }}
      />
    );
  }

  if (shape === "square") {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: CELEBRATION_PARTICLE_STYLE.BOX_SHADOW_TEMPLATE(size, color),
        }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{
        filter: `drop-shadow(0 0 ${size * 0.5}px ${color})`,
      }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
});

/**
 * Celebration animation displayed when blueprint generation is complete.
 * Shows particle explosions and a checkmark to indicate successful completion.
 *
 * @param props - Component props
 * @param props.isComplete - Whether generation has completed (triggers celebration)
 * @param props.onComplete - Optional callback fired when celebration animation finishes
 * @returns The rendered celebration animation or null if not complete
 *
 * @example
 * // Basic usage
 * <GenerationCelebration isComplete={true} />
 *
 * @example
 * // With completion callback
 * <GenerationCelebration isComplete={isGenerating} onComplete={() => setIsGenerating(false)} />
 */

function GenerationCelebrationComponent({
  isComplete,
  onComplete,
}: GenerationCelebrationProps): JSX.Element | null {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isComplete) return;

    if (prefersReducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCheckmark(true);
      const timer = setTimeout(() => {
        setShowCheckmark(false);
        onComplete?.();
      }, CELEBRATION_TIMING.REDUCED_MOTION_DISPLAY);
      return () => clearTimeout(timer);
    }

    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

    const newParticles = generateParticles(centerX, centerY);
    setParticles(newParticles);
    setShowCheckmark(true);

    const particleTimer = setTimeout(() => {
      setParticles([]);
    }, CELEBRATION_TIMING.PARTICLE_FADEOUT);

    const completionTimer = setTimeout(() => {
      setShowCheckmark(false);
      onComplete?.();
    }, CELEBRATION_TIMING.COMPLETION_DELAY);

    return () => {
      clearTimeout(particleTimer);
      clearTimeout(completionTimer);
    };
  }, [isComplete, prefersReducedMotion, onComplete]);

  if (!isComplete && !showCheckmark && particles.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={ACCESSIBILITY_LABELS.CELEBRATION.COMPLETE}
    >
      <AnimatePresence>
        {particles.map((particle) => {
          const endX = Math.cos(particle.angle) * particle.distance;
          const endY = Math.sin(particle.angle) * particle.distance;

          return (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none"
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: endX,
                y: endY,
                opacity: 0,
                scale: [0, 1.2, 0.8],
                rotate: particle.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: CELEBRATION_PARTICLE.ANIMATION_DURATION_S,
                ease: CELEBRATION_ANIMATION.PARTICLE_EASE,
              }}
            >
              <ParticleShape shape={particle.shape} size={particle.size} color={particle.color} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckmark && (
          <motion.div
            className="relative flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: FRAMER_TYPE.SPRING,
              ...SPRING_CONFIG.DEFAULT,
            }}
          >
            <motion.div
              className="absolute w-32 h-32 rounded-full border-4 border-accent-emerald/30"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: [0.5, 1.2, 1.5],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: CELEBRATION_ANIMATION.RIPPLE.DURATION_S,
                ease: CELEBRATION_ANIMATION.RIPPLE.EASE,
              }}
            />

            <motion.div
              className="w-24 h-24 rounded-full bg-accent-emerald/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: FRAMER_TYPE.SPRING,
                ...CELEBRATION_ANIMATION.CHECKMARK_CONTAINER,
                delay: CELEBRATION_ANIMATION.CHECKMARK_DELAY_S,
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                className="text-accent-emerald"
              >
                <motion.circle
                  cx="24"
                  cy="24"
                  r="22"
                  stroke="currentColor"
                  strokeWidth="3"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: CIRCLE_REVEAL_DURATION_S,
                    delay: CHECKMARK_PATH_DELAY_S / 2,
                  }}
                />
                <motion.path
                  d="M14 24L21 31L34 17"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: CIRCLE_REVEAL_DURATION_S, delay: CHECKMARK_PATH_DELAY_S }}
                />
              </svg>
            </motion.div>

            <motion.p
              className="mt-4 text-lg font-semibold text-accent-emerald"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: TEXT_DELAY_S }}
            >
              {CELEBRATION_TEXT.COMPLETE}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const GenerationCelebration = memo(GenerationCelebrationComponent);
