"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import type { Coupon } from "@/lib/types";

export function CouponsAdmin({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initial);
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("15");
  const [amountOff, setAmountOff] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("0");
  const [mode, setMode] = useState<"percent" | "amount">("percent");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function addCoupon(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          percent_off: mode === "percent" ? Number(percentOff) : null,
          amount_off: mode === "amount" ? Number(amountOff) : null,
          min_subtotal: Number(minSubtotal) || 0,
          active: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo crear el cupón");
        return;
      }
      setCoupons((list) => {
        const rest = list.filter(
          (c) => c.code.toLowerCase() !== data.coupon.code.toLowerCase(),
        );
        return [...rest, data.coupon].sort((a, b) =>
          a.code.localeCompare(b.code),
        );
      });
      setCode("");
      setPercentOff("15");
      setAmountOff("");
      setMinSubtotal("0");
      router.refresh();
    } catch {
      setError("Error de red al crear el cupón");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    setError("");
    setBusyId(coupon.id);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon.code,
          percent_off: coupon.percent_off,
          amount_off: coupon.amount_off,
          min_subtotal: coupon.min_subtotal,
          active: !coupon.active,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar");
        return;
      }
      setCoupons((list) =>
        list.map((c) => (c.id === coupon.id ? data.coupon : c)),
      );
      router.refresh();
    } catch {
      setError("Error de red al actualizar");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string, codeLabel: string) {
    if (!confirm(`¿Eliminar cupón ${codeLabel}?`)) return;
    setError("");
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo eliminar");
        return;
      }
      setCoupons((list) => list.filter((c) => c.id !== id));
      router.refresh();
    } catch {
      setError("Error de red al eliminar");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={addCoupon}
        className="max-w-xl space-y-3 rounded-xl border border-line bg-white p-5"
      >
        <p className="text-sm font-semibold">Nuevo cupón</p>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Código</span>
          <input
            className="magi-input uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="TORTUGA15"
            required
          />
        </label>
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={mode === "percent"}
              onChange={() => setMode("percent")}
            />
            Porcentaje
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={mode === "amount"}
              onChange={() => setMode("amount")}
            />
            Monto fijo
          </label>
        </div>
        {mode === "percent" ? (
          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">% off</span>
            <input
              className="magi-input"
              type="number"
              min={1}
              max={100}
              value={percentOff}
              onChange={(e) => setPercentOff(e.target.value)}
              required
            />
          </label>
        ) : (
          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">Monto off (ARS)</span>
            <input
              className="magi-input"
              type="number"
              min={1}
              value={amountOff}
              onChange={(e) => setAmountOff(e.target.value)}
              required
            />
          </label>
        )}
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Mínimo de compra</span>
          <input
            className="magi-input"
            type="number"
            min={0}
            value={minSubtotal}
            onChange={(e) => setMinSubtotal(e.target.value)}
          />
        </label>
        <button className="magi-btn" type="submit" disabled={loading}>
          {loading ? "..." : "Crear cupón"}
        </button>
      </form>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <ul className="space-y-2">
        {coupons.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white px-4 py-3"
          >
            <div>
              <p className="font-semibold tracking-wide">{c.code}</p>
              <p className="text-sm text-ink-soft">
                {c.percent_off != null
                  ? `${c.percent_off}% off`
                  : `${formatPrice(c.amount_off ?? 0)} off`}
                {c.min_subtotal > 0
                  ? ` · mínimo ${formatPrice(c.min_subtotal)}`
                  : ""}
                {" · "}
                {c.active ? "Activo" : "Inactivo"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <button
                type="button"
                disabled={busyId === c.id}
                className="text-accent underline disabled:opacity-50"
                onClick={() => toggleActive(c)}
              >
                {c.active ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                disabled={busyId === c.id}
                className="text-red-700 underline disabled:opacity-50"
                onClick={() => remove(c.id, c.code)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {coupons.length === 0 && (
          <p className="text-ink-soft">Todavía no hay cupones.</p>
        )}
      </ul>
    </div>
  );
}
