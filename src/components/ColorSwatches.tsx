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

/** Corazón SVG relleno con el color del variante. */
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
        d="M12 21s-6.7-4.35-9.33-8.04C.74 10.3 1.1 6.9 3.6 5.2c2.1-1.4 4.7-.9 6.1 1.1L12 9l2.3-2.7c1.4-2 4-2.5 6.1-1.1 2.5 1.7 2.86 5.1.93 7.76C18.7 16.65 12 21 12 21z"
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

  const dim = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
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
            ? "rgba(0,0,0,0.28)"
            : "rgba(0,0,0,0.15)";
        const strokeWidth = active ? 1.6 : light ? 1.2 : 0.9;

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
                ? `rounded-full border px-1.5 py-1 text-[11px] sm:text-xs ${
                    soldOut
                      ? "cursor-not-allowed border-line/50 opacity-45"
                      : active
                        ? "border-ink bg-bg-deep"
                        : "border-line hover:border-ink/50"
                  }`
                : "shrink-0 hover:scale-110"
            }`}
          >
            <span className={`relative inline-flex ${dim} ${soldOut ? "opacity-45" : ""}`}>
              <HeartIcon
                fill={bg}
                stroke={stroke}
                strokeWidth={strokeWidth}
                className="h-full w-full"
              />
              {soldOut && (
                <span
                  className="pointer-events-none absolute inset-[15%] rotate-45 border-t border-ink/70"
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
