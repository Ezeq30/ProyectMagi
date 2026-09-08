"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/store";
import { formatPrice, installmentAmount } from "@/lib/format";
import type { Product } from "@/lib/types";

export function AddToCartPanel({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const variants = product.variants ?? [];
  const colorVariants = variants.filter((v) => v.name.toLowerCase() === "color");
  const [variantId, setVariantId] = useState(colorVariants[0]?.id);
  const selected = useMemo(
    () => colorVariants.find((v) => v.id === variantId) ?? colorVariants[0],
    [colorVariants, variantId],
  );
  const stock = selected?.stock ?? product.stock;
  const out = stock <= 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
        {product.compare_at && product.compare_at > product.price && (
          <p className="text-ink-soft line-through">{formatPrice(product.compare_at)}</p>
        )}
        <p className="mt-1 text-sm text-ink-soft">
          3 x {installmentAmount(product.price)} sin interés
        </p>
      </div>

      {colorVariants.length > 0 && (
        <div>
          <p className="text-sm">
            Color: <strong>{selected?.value}</strong>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {colorVariants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  variantId === v.id ? "border-accent bg-accent text-white" : "border-line"
                }`}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={out}
        className="magi-btn disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() =>
          addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images[0] ?? "",
            quantity: 1,
            maxStock: stock,
            variantId: selected?.id,
            variantLabel: selected ? `${selected.name}: ${selected.value}` : undefined,
          })
        }
      >
        {out ? "Sin stock" : "Agregar al carrito"}
      </button>
    </div>
  );
}
