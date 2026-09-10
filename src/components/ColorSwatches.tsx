"use client";

import { isLightSwatch, swatchCss } from "@/lib/color-swatch";
import type { ProductVariant } from "@/lib/types";

type Props = {
  colors: ProductVariant[];
  selectedId?: string;
  onSelect: (id: string) => void;
  size?: "sm" | "md";
  showStockInTitle?: boolean;
};

export function ColorSwatches({
  colors,
  selectedId,
  onSelect,
  size = "sm",
  showStockInTitle = true,
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
            aria-label={
              showStockInTitle
                ? `${v.value}${soldOut ? " (sin stock)" : ` (${v.stock})`}`
                : v.value
            }
            title={
              showStockInTitle
                ? `${v.value}${soldOut ? " — sin stock" : ` — ${v.stock} u.`}`
                : v.value
            }
            disabled={soldOut}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!soldOut) onSelect(v.id);
            }}
            className={`relative shrink-0 rounded-full border-2 transition ${dim} ${
              soldOut
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer hover:scale-105"
            } ${
              active
                ? "border-ink shadow-[0_0_0_1px_var(--ink)]"
                : light
                  ? "border-line"
                  : "border-transparent outline outline-1 outline-black/20"
            }`}
            style={{ backgroundColor: bg }}
          >
            {soldOut && (
              <span
                className="absolute inset-[4px] rotate-45 border-t border-ink/60"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
