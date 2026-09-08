"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Product } from "@/lib/types";

type Props = {
  product?: Product;
  categories: Category[];
};

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    compare_at: product?.compare_at?.toString() ?? "",
    stock: product?.stock?.toString() ?? "0",
    images: product?.images?.join("\n") ?? "",
    category_id: product?.category_id ?? "",
    featured: product?.featured ?? false,
    bestseller: product?.bestseller ?? false,
    active: product?.active ?? true,
  });

  useEffect(() => {
    if (!product && form.name && !form.slug) {
      // leave slug manual
    }
  }, [form.name, form.slug, product]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      compare_at: form.compare_at ? Number(form.compare_at) : null,
      stock: Number(form.stock),
      images: form.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
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
      {(
        [
          ["name", "Nombre"],
          ["slug", "Slug (url)"],
          ["price", "Precio"],
          ["compare_at", "Precio anterior (opcional)"],
          ["stock", "Stock"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm">
          <span className="mb-1 block text-ink-soft">{label}</span>
          <input
            className="magi-input"
            required={key === "name" || key === "slug" || key === "price" || key === "stock"}
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

      <label className="block text-sm">
        <span className="mb-1 block text-ink-soft">Imágenes (una URL por línea)</span>
        <textarea
          className="magi-input min-h-24"
          value={form.images}
          onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
        />
      </label>

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
        <button type="submit" className="magi-btn" disabled={loading}>
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
