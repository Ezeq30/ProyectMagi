"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { formatPrice, installmentAmount } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const addItem = useCart((s) => s.addItem);
  const image =
    product.images[0] ??
    "https://placehold.co/800x1000/c2a87d/f9f6f1/png?text=Tortugas";
  const outOfStock = product.stock <= 0;

  return (
    <article className="product-card group flex h-full flex-col overflow-hidden rounded-xl border border-line/60 p-2 sm:p-3">
      <Link
        href={`/productos/${product.slug}`}
        className="block overflow-hidden rounded-lg bg-bg-deep"
      >
        <div className="relative aspect-[4/5]">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          />
          {product.compare_at && product.compare_at > product.price && (
            <span className="absolute left-2 top-2 bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white sm:left-3 sm:top-3 sm:text-[11px]">
              Oferta
            </span>
          )}
          {outOfStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/45 px-2 text-center text-xs font-semibold text-white sm:text-sm">
              Sin stock
            </span>
          )}
        </div>
      </Link>
      <div className="mt-2 flex flex-1 flex-col space-y-1 sm:mt-3">
        <Link
          href={`/productos/${product.slug}`}
          className="block text-[13px] leading-snug sm:text-sm md:text-base"
        >
          {product.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <span className="text-sm font-semibold sm:text-base">
            {formatPrice(product.price)}
          </span>
          {product.compare_at && product.compare_at > product.price && (
            <span className="text-xs text-[color:var(--card-muted)] line-through sm:text-sm">
              {formatPrice(product.compare_at)}
            </span>
          )}
        </div>
        <p className="text-[10px] text-[color:var(--card-muted)] sm:text-xs">
          3 x {installmentAmount(product.price)}
        </p>
        {!outOfStock && (
          <button
            type="button"
            className="mt-auto pt-2 text-left text-xs font-semibold text-accent underline-offset-4 hover:underline sm:text-sm"
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
            Agregar al carrito
          </button>
        )}
      </div>
    </article>
  );
}
