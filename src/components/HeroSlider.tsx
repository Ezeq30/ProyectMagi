"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

type Props = {
  images: string[];
  className?: string;
};

const INTERVAL_MS = 5000;

const DEFAULT_SLIDES = [
  "/hero/lima-backpack.jpg",
  "/hero/lima-crossbody.jpg",
  "/hero/trendy-mama.jpg",
];

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 sm:h-8 sm:w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? (
        <path d="M15 5 8 12l7 7" />
      ) : (
        <path d="M9 5l7 7-7 7" />
      )}
    </svg>
  );
}

export function HeroSlider({ images, className = "" }: Props) {
  const slides = images.length > 0 ? images : DEFAULT_SLIDES;
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  return (
    <div className={`group/slider relative h-full w-full overflow-hidden bg-bg-deep ${className}`}>
      {slides.map((src, i) => {
        const active = i === index;
        return (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              active ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={!active}
          >
            <motion.div
              className="absolute inset-0"
              animate={
                active && !reduce
                  ? { scale: [1, 1.06] }
                  : { scale: 1 }
              }
              transition={
                active && !reduce
                  ? { duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }
                  : { duration: 0.4 }
              }
            >
              <Image
                src={src}
                alt=""
                fill
                priority={i === 0}
                className="object-cover object-center"
                sizes="(max-width:768px) 100vw, 55vw"
              />
            </motion.div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 z-[2] -translate-y-1/2 p-2 text-white opacity-70 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] transition hover:opacity-100 sm:left-3 sm:opacity-0 sm:group-hover/slider:opacity-80 sm:hover:!opacity-100"
            aria-label="Imagen anterior"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 z-[2] -translate-y-1/2 p-2 text-white opacity-70 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] transition hover:opacity-100 sm:right-3 sm:opacity-0 sm:group-hover/slider:opacity-80 sm:hover:!opacity-100"
            aria-label="Imagen siguiente"
          >
            <Chevron dir="right" />
          </button>
          <div className="absolute bottom-5 left-1/2 z-[2] flex -translate-x-1/2 gap-2">
            {slides.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-px transition-all ${
                  i === index
                    ? "w-8 bg-white"
                    : "w-4 bg-white/45 hover:bg-white/75"
                }`}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
