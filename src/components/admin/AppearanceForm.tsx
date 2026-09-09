"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BRAND_PALETTE, DEFAULT_THEME } from "@/lib/theme";
import type { ThemeColors } from "@/lib/types";

const CHOICES = [
  ...BRAND_PALETTE.map((c) => ({ name: c.name, hex: c.hex })),
  { name: "Blanco", hex: "#FFFFFF" },
];

const MAX_SLIDES = 8;

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

export function AppearanceForm({
  initial,
  initialSlides,
}: {
  initial: ThemeColors;
  initialSlides: string[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<ThemeColors>({
    ...DEFAULT_THEME,
    ...initial,
    primary: DEFAULT_THEME.primary,
    sage: DEFAULT_THEME.sage,
    gold: DEFAULT_THEME.gold,
  });
  const [slides, setSlides] = useState<string[]>(initialSlides.slice(0, MAX_SLIDES));
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function save(nextTheme: ThemeColors, nextSlides: string[]) {
    setLoading(true);
    setSaved(false);
    setError("");
    const payload: ThemeColors = {
      ...DEFAULT_THEME,
      background: nextTheme.background,
      card: nextTheme.card,
    };
    const res = await fetch("/api/admin/appearance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: payload, hero_slides: nextSlides }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "No se pudo guardar");
      return;
    }
    setTheme(payload);
    if (Array.isArray(data.hero_slides)) setSlides(data.hero_slides);
    setSaved(true);
    router.refresh();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await save(theme, slides);
  }

  async function onPickFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const remaining = MAX_SLIDES - slides.length;
    if (remaining <= 0) {
      setError(`Máximo ${MAX_SLIDES} imágenes en el slider`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      Array.from(fileList).slice(0, remaining).forEach((f) => data.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al subir");
      setSlides((prev) => [...prev, ...(json.urls as string[])].slice(0, MAX_SLIDES));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function moveSlide(index: number, dir: -1 | 1) {
    setSlides((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-ink-soft max-w-2xl">
        Paleta fija de la marca. Solo elegís el <strong>fondo</strong> de la tienda, el{" "}
        <strong>color de las cards</strong> y las <strong>fotos del slider</strong> del inicio.
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

      <div className="space-y-4 rounded-xl border border-line bg-white p-4 sm:p-6">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Slider del inicio
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Fotos que rotan detrás de “Novedades…”. Hasta {MAX_SLIDES}. ({slides.length}/
            {MAX_SLIDES})
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="magi-btn"
            disabled={uploading || slides.length >= MAX_SLIDES}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Subiendo…" : "Agregar imagen"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => onPickFiles(e.target.files)}
          />
        </div>

        {slides.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slides.map((url, index) => (
              <li
                key={`${url}-${index}`}
                className="overflow-hidden rounded-lg border border-line"
              >
                <div className="relative aspect-[4/5] bg-bg-deep">
                  <Image src={url} alt="" fill className="object-cover" sizes="240px" />
                </div>
                <div className="flex flex-wrap items-center gap-2 p-2 text-xs">
                  <span className="text-ink-soft">#{index + 1}</span>
                  <button
                    type="button"
                    className="rounded border border-line px-2 py-1 disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() => moveSlide(index, -1)}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    className="rounded border border-line px-2 py-1 disabled:opacity-40"
                    disabled={index === slides.length - 1}
                    onClick={() => moveSlide(index, 1)}
                  >
                    Bajar
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-accent underline"
                    onClick={() => setSlides((prev) => prev.filter((_, i) => i !== index))}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">Sin imágenes. Se usarán las por defecto.</p>
        )}
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
            <button type="submit" className="magi-btn" disabled={loading || uploading}>
              {loading ? "Guardando..." : "Guardar apariencia"}
            </button>
            <button
              type="button"
              className="magi-btn magi-btn-outline"
              disabled={loading}
              onClick={() => save({ ...DEFAULT_THEME }, slides)}
            >
              Restaurar guía de estilo
            </button>
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
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
