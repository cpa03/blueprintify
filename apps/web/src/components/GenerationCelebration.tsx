import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { CELEBRATION_COLORS } from "../config/constants";

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

interface GenerationCelebrationProps {
  isComplete: boolean;
  onComplete?: () => void;
}

const SHAPES: Particle["shape"][] = ["circle", "square", "star"];

function generateParticles(centerX: number, centerY: number): Particle[] {
  const particleCount = 24;
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 80 + Math.random() * 120;
    const color = CELEBRATION_COLORS[i % CELEBRATION_COLORS.length]!;
    const size = 6 + Math.random() * 8;
    const rotation = Math.random() * 360;
    const shape = SHAPES[i % SHAPES.length]!;

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

function ParticleShape({
  shape,
  size,
  color,
}: {
  shape: Particle["shape"];
  size: number;
  color: string;
}) {
  if (shape === "circle") {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: "50%",
          boxShadow: `0 0 ${size}px ${color}`,
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
          boxShadow: `0 0 ${size}px ${color}`,
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
}

export function GenerationCelebration({
  isComplete,
  onComplete,
}: GenerationCelebrationProps) {
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
      }, 1500);
      return () => clearTimeout(timer);
    }

    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

    const newParticles = generateParticles(centerX, centerY);
    setParticles(newParticles);
    setShowCheckmark(true);

    const particleTimer = setTimeout(() => {
      setParticles([]);
    }, 2000);

    const completionTimer = setTimeout(() => {
      setShowCheckmark(false);
      onComplete?.();
    }, 2500);

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
      aria-label="Generation complete"
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
                duration: 1.2,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <ParticleShape
                shape={particle.shape}
                size={particle.size}
                color={particle.color}
              />
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
              type: "spring",
              stiffness: 400,
              damping: 25,
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
                duration: 1,
                ease: "easeOut",
              }}
            />

            <motion.div
              className="w-24 h-24 rounded-full bg-accent-emerald/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: 0.1,
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
                  transition={{ duration: 0.4, delay: 0.2 }}
                />
                <motion.path
                  d="M14 24L21 31L34 17"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                />
              </svg>
            </motion.div>

            <motion.p
              className="mt-4 text-lg font-semibold text-accent-emerald"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Generation Complete!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GenerationCelebration;
