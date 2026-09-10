"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaymentMethodPicker } from "@/components/PaymentMethodPicker";
import { useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";
import { CASH_DISCOUNT_PERCENT } from "@/lib/payment";

type Quote = {
  shippingCost: number;
  discount: number;
  cashDiscount?: number;
  flatShipping: number;
  shippingMethod?: "delivery" | "seller_arrange";
};

type ShippingMethod = "delivery" | "seller_arrange";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear, paymentMethod, setPaymentMethod } = useCart();
  const cartSubtotal = subtotal();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("delivery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_postal: "",
    notes: "",
  });

  const arrangeWithSeller = shippingMethod === "seller_arrange";
  const payCash = paymentMethod === "cash";

  useEffect(() => {
    async function loadQuote() {
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtotal: cartSubtotal,
          coupon: appliedCoupon || undefined,
          shippingMethod,
          paymentMethod,
        }),
      });
      if (res.ok) setQuote(await res.json());
    }
    if (cartSubtotal >= 0) loadQuote();
  }, [cartSubtotal, appliedCoupon, shippingMethod, paymentMethod]);

  const total = useMemo(() => {
    if (!quote) return cartSubtotal;
    return Math.max(0, cartSubtotal - quote.discount + quote.shippingCost);
  }, [cartSubtotal, quote]);

  async function applyCoupon() {
    setAppliedCoupon(coupon.trim().toUpperCase());
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          coupon: appliedCoupon || undefined,
          shippingMethod,
          paymentMethod,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear el pedido");

      clear();

      if (data.init_point) {
        window.location.href = data.init_point as string;
        return;
      }

      if (data.payPage || data.transfer) {
        router.push(`/checkout/pagar?order=${data.orderNumber}`);
        return;
      }

      router.push(`/checkout/exito?order=${data.orderNumber}&demo=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al checkout");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Checkout</h1>
        <p className="mt-4 text-ink-soft">No hay productos en el carrito.</p>
        <Link href="/productos" className="magi-btn mt-6 inline-flex">
          Ir a productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Checkout</h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {(
            [
              ["customer_name", "Nombre completo"],
              ["customer_email", "Email"],
              ["customer_phone", "Teléfono"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block text-ink-soft">{label}</span>
              <input
                required
                type={key === "customer_email" ? "email" : "text"}
                className="magi-input"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}

          <div className="rounded-xl border border-line bg-card p-4">
            <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
          </div>

          <fieldset className="space-y-3 rounded-xl border border-line bg-card p-4">
            <legend className="px-1 text-sm font-medium text-ink">¿Cómo querés el envío?</legend>
            <label className="flex cursor-pointer gap-3 rounded-lg border border-line p-3 has-[:checked]:border-accent">
              <input
                type="radio"
                name="shippingMethod"
                className="mt-1"
                checked={shippingMethod === "delivery"}
                onChange={() => setShippingMethod("delivery")}
              />
              <span>
                <span className="block font-medium">Envío a domicilio</span>
                <span className="text-sm text-ink-soft">
                  Se suma el costo de envío al total
                  {quote?.flatShipping != null
                    ? ` (${formatPrice(quote.flatShipping)})`
                    : ""}
                  .
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer gap-3 rounded-lg border border-line p-3 has-[:checked]:border-accent">
              <input
                type="radio"
                name="shippingMethod"
                className="mt-1"
                checked={shippingMethod === "seller_arrange"}
                onChange={() => setShippingMethod("seller_arrange")}
              />
              <span>
                <span className="block font-medium">A coordinar con el vendedor</span>
                <span className="text-sm text-ink-soft">
                  Retiro o envío a acordar por WhatsApp. No se cobra envío en este pago.
                </span>
              </span>
            </label>
          </fieldset>

          {!arrangeWithSeller &&
            (
              [
                ["shipping_address", "Dirección"],
                ["shipping_city", "Ciudad"],
                ["shipping_postal", "Código postal"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="mb-1 block text-ink-soft">{label}</span>
                <input
                  required
                  type="text"
                  className="magi-input"
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </label>
            ))}

          {arrangeWithSeller && (
            <p className="rounded-lg border border-line bg-bg-deep/50 px-3 py-2 text-sm text-ink-soft">
              Después de confirmar, coordiná con Magali por WhatsApp el retiro o el envío.
            </p>
          )}

          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">Notas (opcional)</span>
            <textarea
              className="magi-input min-h-24"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder={
                arrangeWithSeller || payCash
                  ? "Ej: prefiero retirar / pago en efectivo al entregar"
                  : ""
              }
            />
          </label>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button type="submit" className="magi-btn" disabled={loading}>
            {loading
              ? "Procesando..."
              : payCash
                ? "Confirmar pedido (efectivo)"
                : "Confirmar y pagar"}
          </button>
          <p className="text-xs text-ink-soft">
            {payCash
              ? `Pago en efectivo con ${CASH_DISCOUNT_PERCENT}% de descuento. Coordinás con Magali por WhatsApp.`
              : "Vas a pagar con Mercado Pago y después podés enviar el comprobante por WhatsApp."}
          </p>
        </form>
      </div>

      <aside className="h-fit rounded-xl border border-line bg-card p-5">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">Resumen</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <li key={`${item.productId}-${item.variantId ?? ""}`} className="flex justify-between gap-3">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <input
            className="magi-input"
            placeholder="Cupón"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button type="button" className="magi-btn magi-btn-outline" onClick={applyCoupon}>
            Aplicar
          </button>
        </div>
        <div className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(cartSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              Descuento
              {payCash ? ` (efectivo ${CASH_DISCOUNT_PERCENT}%)` : ""}
            </span>
            <span>-{formatPrice(quote?.discount ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              {arrangeWithSeller
                ? "Envío (a coordinar)"
                : quote && quote.shippingCost === 0
                  ? "Envío (gratis)"
                  : "Envío"}
            </span>
            <span>
              {arrangeWithSeller || (quote && quote.shippingCost === 0)
                ? formatPrice(0)
                : formatPrice(quote?.shippingCost ?? 0)}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
