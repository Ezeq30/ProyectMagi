"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { formatPrice, installmentAmount } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const addItem = useCart((s) => s.addItem);
  const image = product.images[0] ?? "https://placehold.co/800x1000/c4a574/f7f0e8/png?text=Magi";
  const outOfStock = product.stock <= 0;

  return (
    <article className="group">
      <Link href={`/productos/${product.slug}`} className="block overflow-hidden rounded-sm bg-bg-deep">
        <div className="relative aspect-[4/5]">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 50vw, 25vw"
          />
          {product.compare_at && product.compare_at > product.price && (
            <span className="absolute left-3 top-3 bg-accent px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Oferta
            </span>
          )}
          {outOfStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/45 text-sm font-semibold text-white">
              Sin stock
            </span>
          )}
        </div>
      </Link>
      <div className="mt-3 space-y-1">
        <Link href={`/productos/${product.slug}`} className="block text-sm md:text-base leading-snug">
          {product.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {product.compare_at && product.compare_at > product.price && (
            <span className="text-sm text-ink-soft line-through">
              {formatPrice(product.compare_at)}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-soft">
          3 x {installmentAmount(product.price)} sin interés
        </p>
        {!outOfStock && (
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
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
