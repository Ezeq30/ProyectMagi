"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({
  initial,
  mpReady = false,
}: {
  initial: SiteSettings;
  mpReady?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [mpToken, setMpToken] = useState("");
  const [mpConfigured, setMpConfigured] = useState(mpReady);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        theme: initial.theme,
        mp_access_token: mpToken.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "No se pudo guardar");
      return;
    }
    if (typeof data.mpReady === "boolean") setMpConfigured(data.mpReady);
    if (mpToken.trim()) setMpToken("");
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4 rounded-xl border border-line bg-white p-6">
      {(
        [
          ["whatsapp", "WhatsApp (549...)"],
          ["promo_banner", "Banner promocional"],
          ["hero_headline", "Título hero"],
          ["hero_sub", "Subtítulo hero"],
          ["about_title", "Título quiénes somos"],
          ["about_text", "Texto quiénes somos"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm">
          <span className="mb-1 block text-ink-soft">{label}</span>
          {key === "about_text" || key === "promo_banner" ? (
            <textarea
              className="magi-input min-h-24"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          ) : (
            <input
              className="magi-input"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          )}
        </label>
      ))}

      <div className="space-y-4 rounded-lg border border-line bg-bg-deep/50 p-4">
        <div>
          <p className="text-sm font-semibold text-ink">Pago Mercado Pago</p>
          <p className="mt-1 text-xs text-ink-soft">
            Para cobrar el monto directo en la app, pegá el Access Token de producción de
            Mercado Pago. Alias/CBU sirven para transferencia manual.
          </p>
          <p className="mt-2 rounded-sm border border-line bg-card px-3 py-2 text-xs text-ink-soft">
            En cuentas nuevas, Mercado Pago puede retener el dinero ~14–18 días en las
            primeras ventas (aunque el cobro ya esté OK). Después suele liberar al
            instante o en 24 h. Cuando figure “disponible”, retirá a tu CBU desde la app
            de Mercado Pago.
          </p>
          <p className="mt-2 text-xs">
            Estado pago online:{" "}
            <strong className={mpConfigured ? "text-success" : "text-red-700"}>
              {mpConfigured ? "Activo" : "Pendiente (falta token)"}
            </strong>
          </p>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">
            Access Token Mercado Pago {mpConfigured ? "(dejar vacío para no cambiar)" : ""}
          </span>
          <input
            className="magi-input font-mono text-xs"
            type="password"
            autoComplete="off"
            placeholder="APP_USR-…"
            value={mpToken}
            onChange={(e) => setMpToken(e.target.value)}
          />
          <a
            className="mt-1 inline-block text-xs text-accent underline"
            href="https://www.mercadopago.com.ar/developers/panel/app"
            target="_blank"
            rel="noreferrer"
          >
            Obtener token en Mercado Pago Developers
          </a>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Alias (Mercado Pago)</span>
          <input
            className="magi-input"
            placeholder="ej: maitortugas.mp"
            value={form.payment_alias}
            onChange={(e) => setForm((f) => ({ ...f, payment_alias: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">CBU / CVU</span>
          <input
            className="magi-input"
            placeholder="22 dígitos"
            value={form.payment_cbu}
            onChange={(e) => setForm((f) => ({ ...f, payment_cbu: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Titular de la cuenta</span>
          <input
            className="magi-input"
            placeholder="Nombre y apellido"
            value={form.payment_holder}
            onChange={(e) => setForm((f) => ({ ...f, payment_holder: e.target.value }))}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Costo de envío ($)</span>
          <input
            className="magi-input"
            type="number"
            min={0}
            value={form.flat_shipping_cost}
            onChange={(e) =>
              setForm((f) => ({ ...f, flat_shipping_cost: Number(e.target.value) }))
            }
          />
          <span className="mt-1 block text-xs text-ink-soft">
            Se suma al total de cada pedido (ej. 4500). Poné 0 para pruebas sin envío.
          </span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Envío gratis desde ($)</span>
          <input
            className="magi-input"
            type="number"
            min={0}
            value={form.free_shipping_from}
            onChange={(e) =>
              setForm((f) => ({ ...f, free_shipping_from: Number(e.target.value) }))
            }
          />
          <span className="mt-1 block text-xs text-ink-soft">
            Si el subtotal llega a este monto, el envío queda en $0. Usá 0 para desactivar.
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="magi-btn">
        Guardar configuración
      </button>
      {saved && <p className="text-sm text-success">Guardado.</p>}
    </form>
  );
}
