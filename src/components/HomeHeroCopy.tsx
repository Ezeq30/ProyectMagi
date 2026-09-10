"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { WarmParticles } from "@/components/WarmParticles";

type Props = {
  headline: string;
  sub: string;
};

export function HomeHeroCopy({ headline, sub }: Props) {
  const reduce = useReducedMotion();

  const fade = (delay: number) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1] as const,
            delay,
          },
        };

  return (
    <div className="relative order-2 flex flex-col justify-center overflow-hidden bg-bg px-4 py-10 sm:px-10 sm:py-16 lg:order-1 lg:px-14 xl:px-20">
      <WarmParticles count={12} />
      <div className="relative z-[2]">
        <motion.p
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-[11px] sm:tracking-[0.28em]"
          {...fade(0.05)}
        >
          Accesorios Tortugas Online
        </motion.p>
        <motion.h1
          className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-[2rem] leading-[1.08] tracking-tight text-ink sm:mt-4 sm:text-5xl md:text-6xl lg:text-[3.75rem] lg:leading-[1.05]"
          {...fade(0.15)}
        >
          {headline}
        </motion.h1>
        <motion.div
          className="mt-4 h-px origin-left bg-gold"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          style={{ width: "4rem" }}
        />
        <motion.p
          className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-soft sm:mt-5 sm:text-lg"
          {...fade(0.28)}
        >
          {sub}
        </motion.p>
        <motion.div
          className="mt-7 flex w-full flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3"
          {...fade(0.4)}
        >
          <Link href="/productos" className="magi-btn w-full justify-center sm:w-auto">
            Ver productos
          </Link>
          <Link
            href="/como-comprar"
            className="magi-btn magi-btn-outline w-full justify-center sm:w-auto"
          >
            Cómo comprar
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
