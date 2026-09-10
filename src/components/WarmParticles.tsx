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

/** Partículas cálidas (gold/sage) muy sutiles — solo home, respetan reduced-motion. */
export function WarmParticles({ count = 14 }: { count?: number }) {
  const reduce = useReducedMotion();
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${6 + ((i * 17) % 88)}%`,
      size: 3 + (i % 4),
      duration: 14 + (i % 7) * 2.2,
      delay: (i % 8) * 0.9,
      opacity: 0.18 + (i % 5) * 0.04,
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
          className="absolute bottom-[-8%] rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background:
              p.id % 3 === 0
                ? "var(--gold)"
                : p.id % 3 === 1
                  ? "var(--accent)"
                  : "color-mix(in srgb, var(--gold) 55%, white)",
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px color-mix(in srgb, var(--gold) 35%, transparent)`,
          }}
          animate={{
            y: ["0vh", "-110vh"],
            x: [0, p.id % 2 === 0 ? 12 : -14, 0],
            opacity: [0, p.opacity, p.opacity * 0.6, 0],
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
