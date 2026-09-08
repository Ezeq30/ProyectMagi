"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND_PALETTE, DEFAULT_THEME } from "@/lib/theme";
import type { ThemeColors } from "@/lib/types";

const CHOICES = [
  ...BRAND_PALETTE.map((c) => ({ name: c.name, hex: c.hex })),
  { name: "Blanco", hex: "#FFFFFF" },
];

function SwatchPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {CHOICES.map((c) => {
          const selected = c.hex.toUpperCase() === value.toUpperCase();
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => onChange(c.hex)}
              className={`rounded-xl border p-2 text-left transition ${
                selected
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-line hover:border-accent/50"
              }`}
            >
              <span
                className="mb-2 block h-10 w-full rounded-lg border border-black/5"
                style={{ background: c.hex }}
              />
              <span className="block text-xs font-medium leading-tight">{c.name}</span>
              <span className="block font-mono text-[10px] text-ink-soft uppercase">
                {c.hex}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AppearanceForm({ initial }: { initial: ThemeColors }) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeColors>({
    ...DEFAULT_THEME,
    ...initial,
    primary: DEFAULT_THEME.primary,
    sage: DEFAULT_THEME.sage,
    gold: DEFAULT_THEME.gold,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save(next: ThemeColors) {
    setLoading(true);
    setSaved(false);
    const payload: ThemeColors = {
      ...DEFAULT_THEME,
      background: next.background,
      card: next.card,
    };
    const res = await fetch("/api/admin/appearance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: payload }),
    });
    setLoading(false);
    if (res.ok) {
      setTheme(payload);
      setSaved(true);
      router.refresh();
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await save(theme);
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-ink-soft max-w-2xl">
        Paleta fija de la marca. Solo elegís el <strong>fondo</strong> de la tienda y el{" "}
        <strong>color de las cards</strong> de producto.
      </p>

      <div className="rounded-xl border border-line bg-white p-4 sm:p-5">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
          Paleta de marca (fija)
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BRAND_PALETTE.map((c) => (
            <div key={c.hex} className="overflow-hidden rounded-lg border border-line">
              <div className="h-14" style={{ background: c.hex }} />
              <div className="p-2">
                <p className="text-xs font-medium">{c.name}</p>
                <p className="font-mono text-[10px] text-ink-soft">{c.hex}</p>
                <p className="mt-0.5 text-[10px] text-ink-soft">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8 rounded-xl border border-line bg-white p-4 sm:p-6">
          <SwatchPicker
            label="Fondo de la tienda"
            value={theme.background}
            onChange={(hex) => setTheme((t) => ({ ...t, background: hex }))}
          />
          <SwatchPicker
            label="Color de las cards"
            value={theme.card}
            onChange={(hex) => setTheme((t) => ({ ...t, card: hex }))}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="submit" className="magi-btn" disabled={loading}>
              {loading ? "Guardando..." : "Guardar apariencia"}
            </button>
            <button
              type="button"
              className="magi-btn magi-btn-outline"
              disabled={loading}
              onClick={() => save({ ...DEFAULT_THEME })}
            >
              Restaurar guía de estilo
            </button>
          </div>
          {saved && <p className="text-sm text-success">Apariencia actualizada.</p>}
        </div>

        <aside className="overflow-hidden rounded-xl border border-line">
          <div
            className="p-3 text-center text-xs uppercase tracking-widest"
            style={{ background: theme.background, color: "#3a342c" }}
          >
            Vista previa
          </div>
          <div className="space-y-4 p-4 sm:p-6" style={{ background: theme.background }}>
            <div
              className="overflow-hidden rounded-lg p-3 shadow-sm"
              style={{ background: theme.card, color: "#3a342c" }}
            >
              <div
                className="mb-3 aspect-[4/5] rounded-md"
                style={{ background: DEFAULT_THEME.primary }}
              />
              <p className="text-sm font-medium">Producto ejemplo</p>
              <p className="text-xs opacity-70">$45.000</p>
            </div>
            <button
              type="button"
              className="w-full rounded-full py-2.5 text-sm text-white"
              style={{ background: DEFAULT_THEME.sage }}
            >
              Botón de la marca
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
