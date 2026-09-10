"use client";

import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { useMemo } from "react";

type Particle = {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

/** Partículas cálidas visibles en el hero (sin saturar). */
export function WarmParticles({ count = 22 }: { count?: number }) {
  const reduce = useReducedMotion();
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${4 + ((i * 13) % 92)}%`,
      size: 4 + (i % 5),
      duration: 11 + (i % 6) * 1.8,
      delay: (i % 10) * 0.55,
      opacity: 0.35 + (i % 4) * 0.08,
    }));
  }, [count]);

  if (reduce) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute bottom-[-10%] rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background:
              p.id % 3 === 0
                ? "var(--gold)"
                : p.id % 3 === 1
                  ? "var(--accent)"
                  : "#e8d5b5",
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px color-mix(in srgb, var(--gold) 55%, transparent)`,
          }}
          animate={{
            y: ["0vh", "-115vh"],
            x: [0, p.id % 2 === 0 ? 18 : -20, 6],
            opacity: [0, p.opacity, p.opacity * 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
