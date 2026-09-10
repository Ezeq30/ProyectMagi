"use client";

import { isLightSwatch, swatchCss } from "@/lib/color-swatch";
import type { ProductVariant } from "@/lib/types";

type Props = {
  colors: ProductVariant[];
  selectedId?: string;
  onSelect: (id: string) => void;
  size?: "sm" | "md";
  showLabels?: boolean;
};

function HeartIcon({
  fill,
  stroke,
  strokeWidth,
  className,
}: {
  fill: string;
  stroke: string;
  strokeWidth: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ColorSwatches({
  colors,
  selectedId,
  onSelect,
  size = "sm",
  showLabels = false,
}: Props) {
  if (colors.length === 0) return null;

  // Más visibles: cards ~22px, ficha ~26px
  const dim = size === "md" ? "h-7 w-7" : "h-[1.35rem] w-[1.35rem] sm:h-6 sm:w-6";

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="listbox"
      aria-label="Colores"
    >
      {colors.map((v) => {
        const soldOut = v.stock <= 0;
        const active = selectedId === v.id;
        const bg = swatchCss(v.value);
        const light = isLightSwatch(bg);
        const stroke = active
          ? "var(--ink)"
          : light
            ? "rgba(0,0,0,0.35)"
            : "rgba(0,0,0,0.2)";
        const strokeWidth = active ? 1.4 : 1;

        return (
          <button
            key={v.id}
            type="button"
            role="option"
            aria-selected={active}
            aria-label={`${v.value}${soldOut ? " (sin stock)" : ` (${v.stock} disponibles)`}`}
            title={`${v.value}${soldOut ? " — sin stock" : ` — ${v.stock} u.`}`}
            disabled={soldOut}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!soldOut) onSelect(v.id);
            }}
            className={`inline-flex items-center gap-1.5 transition ${
              showLabels
                ? `rounded-full border px-2 py-1 text-xs ${
                    soldOut
                      ? "cursor-not-allowed border-line/50 opacity-45"
                      : active
                        ? "border-ink bg-bg-deep shadow-sm"
                        : "border-line hover:border-ink/50"
                  }`
                : `shrink-0 rounded-full p-0.5 ${
                    active ? "bg-bg-deep ring-1 ring-ink/40" : "hover:scale-110"
                  }`
            }`}
          >
            <span className={`relative inline-flex ${dim} ${soldOut ? "opacity-45" : ""}`}>
              <HeartIcon
                fill={bg}
                stroke={stroke}
                strokeWidth={strokeWidth}
                className="h-full w-full drop-shadow-sm"
              />
              {soldOut && (
                <span
                  className="pointer-events-none absolute inset-[18%] rotate-45 border-t-2 border-ink/70"
                  aria-hidden
                />
              )}
            </span>
            {showLabels && (
              <span className={soldOut ? "line-through text-ink-soft" : ""}>
                {v.value}
                <span className="text-ink-soft"> ({v.stock})</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
