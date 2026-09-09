"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

type Props = {
  product?: Product;
  categories: Category[];
};

type ColorRow = { value: string; stock: number };

const MAX_IMAGES = 5;

function initialColors(product?: Product): ColorRow[] {
  return (product?.variants ?? [])
    .filter((v) => v.name.toLowerCase() === "color")
    .map((v) => ({ value: v.value, stock: v.stock }));
}

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(
    (product?.images ?? []).slice(0, MAX_IMAGES),
  );
  const [colors, setColors] = useState<ColorRow[]>(initialColors(product));
  const [colorDraft, setColorDraft] = useState("");
  const [colorStockDraft, setColorStockDraft] = useState("1");
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    compare_at: product?.compare_at?.toString() ?? "",
    stock: product?.stock?.toString() ?? "0",
    category_id: product?.category_id ?? "",
    featured: product?.featured ?? false,
    bestseller: product?.bestseller ?? false,
    active: product?.active ?? true,
  });

  const canAutoSlug = useMemo(() => !product, [product]);
  const remainingSlots = MAX_IMAGES - images.length;
  const canAddMore = remainingSlots > 0;
  const colorsTotal = useMemo(
    () => colors.reduce((s, c) => s + Math.max(0, Number(c.stock) || 0), 0),
    [colors],
  );
  const hasColors = colors.length > 0;

  function addColor() {
    const value = colorDraft.trim();
    const stock = Math.max(0, Number(colorStockDraft) || 0);
    if (!value) return;
    const exists = colors.some((c) => c.value.toLowerCase() === value.toLowerCase());
    if (exists) {
      setError("Ese color ya está cargado");
      setColorDraft("");
      return;
    }
    setColors((prev) => [...prev, { value, stock }]);
    setColorDraft("");
    setColorStockDraft("1");
    setError("");
  }

  function removeColor(value: string) {
    setColors((prev) => prev.filter((c) => c.value !== value));
  }

  function updateColorStock(value: string, stock: number) {
    setColors((prev) =>
      prev.map((c) =>
        c.value === value ? { ...c, stock: Math.max(0, stock) } : c,
      ),
    );
  }

  async function onPickFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (!canAddMore) {
      setError(`Máximo ${MAX_IMAGES} fotos por producto`);
      return;
    }

    const selected = Array.from(fileList).slice(0, remainingSlots);
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      selected.forEach((file) => data.append("files", file));
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al subir");
      setImages((prev) => [...prev, ...(json.urls as string[])].slice(0, MAX_IMAGES));
      if (fileList.length > remainingSlots) {
        setError(`Solo se agregaron ${remainingSlots} foto(s). Máximo ${MAX_IMAGES}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url));
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      price: Number(form.price),
      compare_at: form.compare_at ? Number(form.compare_at) : null,
      stock: hasColors ? colorsTotal : Number(form.stock),
      images,
      colors,
      category_id: form.category_id || null,
      featured: form.featured,
      bestseller: form.bestseller,
      active: form.active,
    };

    const res = await fetch(
      product ? `/api/admin/products/${product.id}` : "/api/admin/products",
      {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo guardar");
      return;
    }
    router.push("/admin/productos");
    router.refresh();
  }

  async function onDelete() {
    if (!product) return;
    if (!confirm("¿Eliminar producto?")) return;
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4 rounded-xl border border-line bg-white p-6">
      <label className="block text-sm">
        <span className="mb-1 block text-ink-soft">Nombre</span>
        <input
          className="magi-input"
          required
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            setForm((f) => ({
              ...f,
              name,
              slug: canAutoSlug ? slugify(name) : f.slug || slugify(name),
            }));
          }}
        />
      </label>

      {(
        [
          ["price", "Precio"],
          ["compare_at", "Precio anterior (opcional)"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm">
          <span className="mb-1 block text-ink-soft">{label}</span>
          <input
            className="magi-input"
            type="number"
            required={key === "price"}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          />
        </label>
      ))}

      {!hasColors ? (
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Stock</span>
          <input
            className="magi-input"
            type="number"
            required
            min={0}
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          />
          <span className="mt-1 block text-xs text-ink-soft">
            Si cargás colores, el stock se maneja por color.
          </span>
        </label>
      ) : (
        <p className="rounded-lg border border-line bg-bg-deep/50 px-3 py-2 text-sm text-ink-soft">
          Stock total (suma de colores): <strong className="text-ink">{colorsTotal}</strong>
        </p>
      )}

      <label className="block text-sm">
        <span className="mb-1 block text-ink-soft">Descripción</span>
        <textarea
          className="magi-input min-h-28"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </label>

      <div className="space-y-2">
        <p className="text-sm text-ink-soft">Colores disponibles</p>
        <p className="text-xs text-ink-soft">
          Agregá color + cantidad. El cliente ve cuántos hay y elige al comprar.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            className="magi-input min-w-[8rem] flex-1"
            placeholder="Nombre del color"
            value={colorDraft}
            onChange={(e) => setColorDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColor();
              }
            }}
          />
          <input
            className="magi-input w-24"
            type="number"
            min={0}
            placeholder="Cant."
            value={colorStockDraft}
            onChange={(e) => setColorStockDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColor();
              }
            }}
          />
          <button type="button" className="magi-btn magi-btn-outline" onClick={addColor}>
            Agregar color
          </button>
        </div>
        {colors.length > 0 ? (
          <ul className="space-y-2 pt-1">
            {colors.map((color) => (
              <li
                key={color.value}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-bg-deep px-3 py-2 text-sm"
              >
                <span className="min-w-[5rem] font-medium">{color.value}</span>
                <label className="flex items-center gap-1 text-ink-soft">
                  Cant.
                  <input
                    className="magi-input w-20 py-1"
                    type="number"
                    min={0}
                    value={color.stock}
                    onChange={(e) =>
                      updateColorStock(color.value, Number(e.target.value) || 0)
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeColor(color.value)}
                  className="ml-auto text-ink-soft hover:text-accent"
                  aria-label={`Quitar ${color.value}`}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink-soft">Sin colores cargados (opcional).</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm text-ink-soft">
          Fotos del producto{" "}
          <span className="text-xs">
            ({images.length}/{MAX_IMAGES})
          </span>
        </p>
        <p className="text-xs text-ink-soft">
          Hasta {MAX_IMAGES} fotos (útil para mostrar distintos colores).
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="magi-btn"
            disabled={uploading || !canAddMore}
            onClick={() => fileRef.current?.click()}
          >
            {uploading
              ? "Subiendo..."
              : canAddMore
                ? "Elegir de galería / archivo"
                : `Máximo ${MAX_IMAGES} fotos`}
          </button>
          <p className="self-center text-xs text-ink-soft">
            JPG, PNG o WEBP · hasta 8MB · máximo {MAX_IMAGES} fotos
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => onPickFiles(e.target.files)}
        />

        {images.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((url, index) => (
              <li
                key={url}
                className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-bg-deep"
              >
                <Image
                  src={url}
                  alt={`Foto ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized={url.startsWith("data:")}
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-ink/80 px-2 py-0.5 text-[10px] text-white">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-1 text-xs text-white"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-bg-deep/50 px-4 py-10 text-sm text-ink-soft hover:border-accent hover:text-accent"
          >
            <span className="text-base font-medium text-ink">Agregar fotos</span>
            <span>Hasta {MAX_IMAGES} fotos · galería o archivo</span>
          </button>
        )}
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-ink-soft">Categoría</span>
        <select
          className="magi-input"
          value={form.category_id}
          onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-4 text-sm">
        {(
          [
            ["featured", "Destacado"],
            ["bestseller", "Más vendido"],
            ["active", "Activo"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
            />
            {label}
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="magi-btn" disabled={loading || uploading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
        {product && (
          <button type="button" className="magi-btn magi-btn-outline" onClick={onDelete}>
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}
