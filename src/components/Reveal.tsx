"use client";

import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  /** Dirección de entrada */
  from?: "up" | "left" | "right";
  delay?: number;
};

const offsets = {
  up: { y: 28, x: 0 },
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
} as const;

export function Reveal({
  children,
  className = "",
  as = "div",
  from = "up",
  delay = 0,
}: Props) {
  const reduce = useReducedMotion();
  const offset = offsets[from];
  const Tag = motion[as];

  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
    >
      {children}
    </Tag>
  );
}
