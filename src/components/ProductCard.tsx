"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ColorSwatches } from "@/components/ColorSwatches";
import { useCart } from "@/lib/cart/store";
import {
  colorVariantsOf,
  imageForColorVariant,
} from "@/lib/color-swatch";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const addItem = useCart((s) => s.addItem);
  const colorVariants = useMemo(
    () => colorVariantsOf(product.variants),
    [product.variants],
  );
  const firstAvailable =
    colorVariants.find((v) => v.stock > 0)?.id ?? colorVariants[0]?.id;
  const [selectedId, setSelectedId] = useState(firstAvailable);

  const selected = colorVariants.find((v) => v.id === selectedId);
  const selectedIndex = Math.max(
    0,
    colorVariants.findIndex((v) => v.id === selectedId),
  );
  const image = imageForColorVariant(
    product.images,
    selected,
    selectedIndex,
  );

  const available =
    colorVariants.length > 0
      ? colorVariants.reduce((s, v) => s + v.stock, 0)
      : product.stock;
  const outOfStock = available <= 0;
  const selectedOut = selected ? selected.stock <= 0 : outOfStock;
  const onSale = Boolean(product.compare_at && product.compare_at > product.price);

  function addToCart() {
    const stock = selected?.stock ?? product.stock;
    if (stock <= 0) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image,
      quantity: 1,
      maxStock: stock,
      variantId: selected?.id,
      variantLabel: selected ? `Color: ${selected.value}` : undefined,
    });
  }

  return (
    <article className="product-card group flex h-full flex-col overflow-hidden">
      <Link
        href={`/productos/${product.slug}`}
        className="relative block overflow-hidden bg-bg-deep"
      >
        <div className="relative aspect-[4/5]">
          <Image
            src={image}
            alt={
              selected
                ? `${product.name} — ${selected.value}`
                : product.name
            }
            fill
            className="product-card-image object-cover object-center"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          />
          {onSale && (
            <span
              data-sale
              className="absolute left-2 top-2 bg-[color:var(--sale)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.14em]"
            >
              Oferta
            </span>
          )}
          {outOfStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/50 px-2 text-center text-xs font-semibold uppercase tracking-wider text-white">
              Sin stock
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-1.5 pb-3.5 pt-3 sm:px-2 sm:pt-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-semibold tracking-wide">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-xs text-ink-soft line-through">
              {formatPrice(product.compare_at!)}
            </span>
          )}
        </div>

        {/* Altura fija de 2 líneas para alinear corazones entre cards */}
        <Link
          href={`/productos/${product.slug}`}
          className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[13px] leading-snug tracking-wide text-ink sm:min-h-[2.75rem] sm:text-sm"
        >
          {product.name}
          {selected ? (
            <span className="text-ink-soft"> · {selected.value}</span>
          ) : null}
        </Link>

        <div className="mt-2.5 flex min-h-7 items-start">
          {colorVariants.length > 0 ? (
            <ColorSwatches
              colors={colorVariants}
              selectedId={selectedId}
              onSelect={setSelectedId}
              size="md"
            />
          ) : null}
        </div>

        {!outOfStock && (
          <button
            type="button"
            disabled={selectedOut}
            className="mt-auto pt-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-accent transition hover:text-accent-deep disabled:cursor-not-allowed disabled:opacity-40"
            onClick={addToCart}
          >
            {selectedOut ? "Sin stock" : "Agregar"}
          </button>
        )}
      </div>
    </article>
  );
}
