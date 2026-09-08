"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";

type Quote = {
  shippingCost: number;
  discount: number;
  flatShipping: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const cartSubtotal = subtotal();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
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

  useEffect(() => {
    async function loadQuote() {
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtotal: cartSubtotal, coupon: appliedCoupon || undefined }),
      });
      if (res.ok) setQuote(await res.json());
    }
    if (cartSubtotal >= 0) loadQuote();
  }, [cartSubtotal, appliedCoupon]);

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
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear el pedido");

      clear();

      if (data.init_point) {
        window.location.href = data.init_point;
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
              ["shipping_address", "Dirección"],
              ["shipping_city", "Ciudad"],
              ["shipping_postal", "Código postal"],
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
          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">Notas (opcional)</span>
            <textarea
              className="magi-input min-h-24"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </label>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button type="submit" className="magi-btn" disabled={loading}>
            {loading ? "Procesando..." : "Pagar con Mercado Pago"}
          </button>
          <p className="text-xs text-ink-soft">
            Si Mercado Pago aún no está configurado, el pedido se confirma en modo demo y podés
            cerrarlo por{" "}
            <a
              className="underline"
              href={whatsappUrl("Hola! Quiero completar mi compra en Accesorios Tortugas Online")}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            .
          </p>
        </form>
      </div>

      <aside className="h-fit rounded-xl border border-line bg-white p-5">
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
            <span>Descuento</span>
            <span>-{formatPrice(quote?.discount ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span>{formatPrice(quote?.shippingCost ?? 0)}</span>
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
