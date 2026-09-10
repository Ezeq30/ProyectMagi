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

export function ColorSwatches({
  colors,
  selectedId,
  onSelect,
  size = "sm",
  showLabels = false,
}: Props) {
  if (colors.length === 0) return null;

  const dim = size === "md" ? "h-6 w-6" : "h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5";

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
        const border = light
          ? "rgba(0,0,0,0.18)"
          : "rgba(0,0,0,0.12)";

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
                    active
                      ? "ring-1 ring-ink/45 ring-offset-2 ring-offset-card"
                      : "hover:opacity-80"
                  }`
            }`}
          >
            <span
              className={`relative inline-block shrink-0 rounded-full ${dim} ${
                soldOut ? "opacity-45" : ""
              }`}
              style={{
                backgroundColor: bg,
                boxShadow: `inset 0 0 0 1px ${border}`,
              }}
            >
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
