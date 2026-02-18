import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { CELEBRATION_COLORS } from "../config/constants";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  duration: number;
}

interface AnimatedCopyButtonProps {
  onCopy: () => void;
  isCopied: boolean;
  hasContent: boolean;
  className?: string;
}

export function AnimatedCopyButton({
  onCopy,
  isCopied,
  hasContent,
  className = "",
}: AnimatedCopyButtonProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleIdRef = useRef(0);

  const createParticles = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const particleCount = 12;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      const color: string =
        CELEBRATION_COLORS[
          Math.floor(Math.random() * CELEBRATION_COLORS.length)
        ] ?? "#10b981";
      const size = 3 + Math.random() * 3;
      const duration = 400 + Math.random() * 200;

      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        angle,
        distance,
        color,
        size,
        duration,
      });
    }

    setParticles(newParticles);

    setTimeout(() => {
      setParticles([]);
    }, 700);
  }, []);

  const handleClick = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement>) => {
      if (!hasContent) return;
      createParticles();
      onCopy();
    },
    [hasContent, onCopy, createParticles],
  );

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={!hasContent}
      className={clsx(
        "relative text-sm px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus-visible:ring-2 focus-visible:ring-primary-500/50",
        isCopied
          ? "bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/50"
          : "btn-ghost text-dark-300 hover:text-white hover:bg-dark-800/50",
        className,
      )}
      aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
      aria-live="polite"
      animate={{
        scale: isPressed ? 0.92 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      whileHover={
        hasContent
          ? {
              scale: 1.02,
            }
          : undefined
      }
    >
      <AnimatePresence>
        {particles.map((particle) => {
          const endX =
            particle.x + Math.cos(particle.angle) * particle.distance;
          const endY =
            particle.y + Math.sin(particle.angle) * particle.distance;

          return (
            <motion.span
              key={particle.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0,
              }}
              animate={{
                x: endX - particle.x,
                y: endY - particle.y,
                opacity: 0,
                scale: [0, 1.5, 0.5],
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: particle.duration / 1000,
                ease: [0.23, 1, 0.32, 1],
              }}
            />
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {isCopied && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-accent-emerald pointer-events-none"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCopied && (
          <motion.div
            className="absolute inset-0 bg-accent-emerald/20 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      <span className="relative z-10 flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isCopied ? (
            <motion.span
              key="copied"
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25,
              }}
            >
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                  delay: 0.05,
                }}
              >
                <motion.path
                  d="M3 8L6.5 11.5L13 5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                />
              </motion.svg>
              <motion.span
                className="font-medium"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                Copied!
              </motion.span>
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                whileHover={
                  hasContent
                    ? {
                        rotate: [0, -10, 10, -5, 5, 0],
                        transition: { duration: 0.5 },
                      }
                    : undefined
                }
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </motion.svg>
              <span>Copy</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
