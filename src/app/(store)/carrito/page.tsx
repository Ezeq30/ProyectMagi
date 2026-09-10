"use client";

import Image from "next/image";
import Link from "next/link";
import { PaymentMethodPicker } from "@/components/PaymentMethodPicker";
import { useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";
import { calcCashDiscount, CASH_DISCOUNT_PERCENT } from "@/lib/payment";

export default function CartPage() {
  const {
    items,
    setQuantity,
    removeItem,
    subtotal,
    paymentMethod,
    setPaymentMethod,
  } = useCart();
  const listTotal = subtotal();
  const cashOff = calcCashDiscount(listTotal, paymentMethod);
  const payable = Math.max(0, listTotal - cashOff);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Carrito de compras</h1>

      {items.length === 0 ? (
        <div className="mt-8">
          <p className="text-ink-soft">El carrito está vacío.</p>
          <Link href="/productos" className="magi-btn mt-6 inline-flex">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId ?? ""}`}
                className="flex gap-4 border-b border-line pb-4"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-bg-deep">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <Link href={`/productos/${item.slug}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  {item.variantLabel && (
                    <p className="text-sm text-ink-soft">{item.variantLabel}</p>
                  )}
                  <p className="mt-1">{formatPrice(item.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 border border-line"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1, item.variantId)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="h-8 w-8 border border-line"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1, item.variantId)
                      }
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="ml-4 text-sm text-ink-soft underline"
                      onClick={() => removeItem(item.productId, item.variantId)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-line bg-card p-4">
            <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
          </div>

          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-ink-soft">
              Subtotal: {formatPrice(listTotal)}
            </p>
            {cashOff > 0 && (
              <p className="text-sm text-ink-soft">
                Dto. efectivo ({CASH_DISCOUNT_PERCENT}%): -{formatPrice(cashOff)}
              </p>
            )}
            <p className="text-lg">
              Total: <strong>{formatPrice(payable)}</strong>
            </p>
            <Link href="/checkout" className="magi-btn">
              Finalizar compra
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
