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

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
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

  async function onPickFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      Array.from(fileList).forEach((file) => data.append("files", file));
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al subir");
      setImages((prev) => [...prev, ...(json.urls as string[])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url));
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
      stock: Number(form.stock),
      images,
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
          ["stock", "Stock"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm">
          <span className="mb-1 block text-ink-soft">{label}</span>
          <input
            className="magi-input"
            type="number"
            required={key === "price" || key === "stock"}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          />
        </label>
      ))}

      <label className="block text-sm">
        <span className="mb-1 block text-ink-soft">Descripción</span>
        <textarea
          className="magi-input min-h-28"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </label>

      <div className="space-y-3">
        <p className="text-sm text-ink-soft">Fotos del producto</p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="magi-btn"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Subiendo..." : "Elegir de galería / archivo"}
          </button>
          <p className="self-center text-xs text-ink-soft">
            JPG, PNG o WEBP · hasta 8MB · podés elegir varias
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
            {images.map((url) => (
              <li
                key={url}
                className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-bg-deep"
              >
                <Image
                  src={url}
                  alt="Foto producto"
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized={url.startsWith("data:")}
                />
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
            <span>Abrí la galería o seleccioná un archivo de tu dispositivo</span>
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
