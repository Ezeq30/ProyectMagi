"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, subtotal } = useCart();
  const total = subtotal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Cerrar carrito"
        onClick={closeCart}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Carrito</h2>
          <button type="button" onClick={closeCart} className="text-sm text-ink-soft">
            Cerrar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-ink-soft">El carrito de compras está vacío.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId ?? ""}`}
                  className="flex gap-3 border-b border-line/60 pb-4"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-bg-deep">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.variantLabel && (
                      <p className="text-xs text-ink-soft">{item.variantLabel}</p>
                    )}
                    <p className="mt-1 text-sm">{formatPrice(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="h-7 w-7 border border-line"
                        onClick={() =>
                          setQuantity(item.productId, item.quantity - 1, item.variantId)
                        }
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="h-7 w-7 border border-line"
                        onClick={() =>
                          setQuantity(item.productId, item.quantity + 1, item.variantId)
                        }
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-xs text-ink-soft underline"
                        onClick={() => removeItem(item.productId, item.variantId)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </div>
          <Link
            href="/carrito"
            onClick={closeCart}
            className="magi-btn w-full"
          >
            Ver carrito
          </Link>
          <Link
            href="/checkout"
            onClick={closeCart}
            className="magi-btn magi-btn-outline w-full"
          >
            Finalizar compra
          </Link>
        </div>
      </aside>
    </div>
  );
}
