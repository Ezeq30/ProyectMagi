"use client";

import { useEffect, useState } from "react";

type Props = {
  orderNumber: string;
  paymentId?: string;
  initialStatus?: string;
};

export function MpPaymentSync({ orderNumber, paymentId, initialStatus }: Props) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!orderNumber || initialStatus === "paid") return;
    let cancelled = false;

    async function sync() {
      try {
        const res = await fetch("/api/checkout/mp-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber, paymentId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.status === "paid") {
          setNote("Pago confirmado en Mercado Pago.");
        } else if (data.status === "pending") {
          setNote("El pago puede estar pendiente de acreditación.");
        }
      } catch {
        /* silent */
      }
    }

    void sync();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, paymentId, initialStatus]);

  if (!note) return null;
  return <p className="mt-3 text-sm text-ink-soft">{note}</p>;
}
