"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        theme: initial.theme,
      }),
    });
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

      <label className="block text-sm">
        <span className="mb-1 block text-ink-soft">Costo de envío ($)</span>
        <input
          className="magi-input"
          type="number"
          value={form.flat_shipping_cost}
          onChange={(e) =>
            setForm((f) => ({ ...f, flat_shipping_cost: Number(e.target.value) }))
          }
        />
      </label>

      <button type="submit" className="magi-btn">
        Guardar configuración
      </button>
      {saved && <p className="text-sm text-success">Guardado.</p>}
    </form>
  );
}
