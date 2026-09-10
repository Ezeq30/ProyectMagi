"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import {
  buildCustomerOrderMessage,
  buildSellerOrderMessage,
} from "@/lib/order-notify";
import { whatsappUrl } from "@/lib/whatsapp";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "shipped", label: "Enviado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "refunded", label: "Reembolsado" },
];

export function OrdersAdmin({
  initial,
  sellerWhatsapp,
}: {
  initial: Order[];
  sellerWhatsapp: string;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function setStatus(id: string, status: OrderStatus) {
    const previous = orders.find((o) => o.id === id)?.status;
    setError("");
    setBusyId(id);
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, status } : o)),
    );
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (previous) {
          setOrders((list) =>
            list.map((o) => (o.id === id ? { ...o, status: previous } : o)),
          );
        }
        setError(data.error || "No se pudo cambiar el estado");
        return;
      }
      router.refresh();
    } catch {
      if (previous) {
        setOrders((list) =>
          list.map((o) => (o.id === id ? { ...o, status: previous } : o)),
        );
      }
      setError("Error de red al actualizar el pedido");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string, orderNumber: string) {
    if (!confirm(`¿Eliminar el pedido ${orderNumber}?`)) return;
    setError("");
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo eliminar el pedido");
        return;
      }
      setOrders((list) => list.filter((o) => o.id !== id));
      router.refresh();
    } catch {
      setError("Error de red al eliminar el pedido");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-700">{error}</p>}
      {orders.length === 0 && <p className="text-ink-soft">Sin pedidos todavía.</p>}
      {orders.map((order) => (
        <article key={order.id} className="rounded-xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">{order.order_number}</h2>
              <p className="text-sm text-ink-soft">
                {order.customer_name} · {order.customer_email} · {order.customer_phone}
              </p>
              <p className="text-sm text-ink-soft">
                {order.shipping_address}, {order.shipping_city} ({order.shipping_postal})
              </p>
              {order.notes ? (
                <p className="mt-1 text-sm text-ink-soft whitespace-pre-line">{order.notes}</p>
              ) : null}
              <p className="mt-2 text-sm text-ink-soft">
                Envío: {formatPrice(order.shipping_cost)} · Subtotal:{" "}
                {formatPrice(order.subtotal)}
              </p>
              <p className="mt-1 font-semibold">{formatPrice(order.total)}</p>
              {order.mp_payment_id && (
                <p className="mt-2 text-xs text-ink-soft">
                  MP pago: {order.mp_payment_id}
                  {order.status === "paid" ? " · Cobrado en Mercado Pago" : ""}
                </p>
              )}
              {order.mp_money_release_date && (
                <p className="mt-1 text-xs text-gold">
                  Disponible aprox.:{" "}
                  {new Date(order.mp_money_release_date).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {order.mp_status_detail ? ` · ${order.mp_status_detail}` : ""}
                </p>
              )}
              {order.status === "paid" && !order.mp_money_release_date && order.mp_payment_id && (
                <p className="mt-1 text-xs text-ink-soft">
                  Cobrado. La fecha de liberación la define Mercado Pago (cuentas nuevas:
                  ~2 semanas).
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <select
                  className="magi-input w-auto min-w-[9rem]"
                  value={order.status}
                  disabled={busyId === order.id}
                  onChange={(e) => setStatus(order.id, e.target.value as OrderStatus)}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busyId === order.id}
                  onClick={() => remove(order.id, order.order_number)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-ink-soft transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  aria-label={`Eliminar pedido ${order.order_number}`}
                  title="Eliminar"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap justify-end gap-2 text-xs">
                <a
                  href={whatsappUrl(
                    buildCustomerOrderMessage(
                      order,
                      order.status === "shipped" ? "shipped" : "ready",
                    ),
                    order.customer_phone,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line px-3 py-1.5 text-accent hover:bg-bg-deep"
                >
                  WhatsApp cliente
                </a>
                <a
                  href={whatsappUrl(
                    buildSellerOrderMessage(
                      order,
                      order.status === "paid" ? "paid" : "created",
                    ),
                    sellerWhatsapp,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line px-3 py-1.5 text-ink-soft hover:bg-bg-deep"
                  title="Abrí este chat en tu WhatsApp para reenviar el resumen"
                >
                  Resumen WA
                </a>
              </div>
            </div>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-ink-soft">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.product_name}
                {item.variant_label ? ` (${item.variant_label})` : ""} × {item.quantity}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
