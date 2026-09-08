"use client";

import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled", "refunded"];

export function OrdersAdmin({ initial }: { initial: Order[] }) {
  const router = useRouter();

  async function setStatus(id: string, status: OrderStatus) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {initial.length === 0 && <p className="text-ink-soft">Sin pedidos todavía.</p>}
      {initial.map((order) => (
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
              <p className="mt-2 font-semibold">{formatPrice(order.total)}</p>
            </div>
            <select
              className="magi-input w-auto"
              value={order.status}
              onChange={(e) => setStatus(order.id, e.target.value as OrderStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
