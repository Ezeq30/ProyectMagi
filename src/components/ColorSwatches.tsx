"use client";

import { isLightSwatch, swatchCss } from "@/lib/color-swatch";
import type { ProductVariant } from "@/lib/types";

type Props = {
  colors: ProductVariant[];
  selectedId?: string;
  onSelect: (id: string) => void;
  size?: "sm" | "md";
  /** En ficha: mostrar nombre junto al círculo */
  showLabels?: boolean;
};

export function ColorSwatches({
  colors,
  selectedId,
  onSelect,
  size = "sm",
  showLabels = false,
}: Props) {
  if (colors.length === 0) return null;

  const dim = size === "md" ? "h-9 w-9" : "h-6 w-6 sm:h-7 sm:w-7";

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
            className={`inline-flex items-center gap-2 transition ${
              showLabels
                ? `rounded-full border px-2.5 py-1.5 text-sm ${
                    soldOut
                      ? "cursor-not-allowed border-line/50 opacity-45"
                      : active
                        ? "border-ink bg-bg-deep"
                        : "border-line hover:border-ink/50"
                  }`
                : "shrink-0"
            }`}
          >
            <span
              className={`relative shrink-0 rounded-full ${dim} ${
                soldOut ? "opacity-50" : ""
              } ${
                active && !showLabels
                  ? "ring-2 ring-ink ring-offset-2 ring-offset-[color:var(--card)]"
                  : ""
              } ${
                light
                  ? "border border-line shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                  : "border border-black/20"
              }`}
              style={{ backgroundColor: bg }}
              aria-hidden
            >
              {soldOut && (
                <span className="absolute inset-[3px] rotate-45 border-t border-ink/70" />
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
