"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const addItem = useCart((s) => s.addItem);
  const image =
    product.images[0] ??
    "https://placehold.co/800x1000/1a1a1a/fafaf8/png?text=Tortugas";
  const colorVariants = (product.variants ?? []).filter(
    (v) => v.name.toLowerCase() === "color",
  );
  const available =
    colorVariants.length > 0
      ? colorVariants.reduce((s, v) => s + v.stock, 0)
      : product.stock;
  const outOfStock = available <= 0;
  const needsColor = colorVariants.length > 0;
  const onSale = Boolean(product.compare_at && product.compare_at > product.price);

  return (
    <article className="product-card group flex h-full flex-col overflow-hidden">
      <Link
        href={`/productos/${product.slug}`}
        className="relative block overflow-hidden bg-bg-deep"
      >
        <div className="relative aspect-[4/5]">
          <Image
            src={image}
            alt={product.name}
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
      <div className="flex flex-1 flex-col px-1 pb-3 pt-3 sm:px-1.5 sm:pt-4">
        <Link
          href={`/productos/${product.slug}`}
          className="block text-[13px] leading-snug tracking-wide sm:text-sm"
        >
          {product.name}
        </Link>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-semibold tracking-wide">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-xs text-ink-soft line-through">
              {formatPrice(product.compare_at!)}
            </span>
          )}
        </div>
        {!outOfStock &&
          (needsColor ? (
            <Link
              href={`/productos/${product.slug}`}
              className="mt-auto pt-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-accent transition hover:text-accent-deep"
            >
              Elegir color
            </Link>
          ) : (
            <button
              type="button"
              className="mt-auto pt-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-accent transition hover:text-accent-deep"
              onClick={() =>
                addItem({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image,
                  quantity: 1,
                  maxStock: product.stock,
                })
              }
            >
              Agregar
            </button>
          ))}
      </div>
    </article>
  );
}
