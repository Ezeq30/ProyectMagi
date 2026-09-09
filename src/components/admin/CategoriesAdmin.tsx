"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";

export function CategoriesAdmin({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [categories, setCategories] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo agregar la categoría");
        return;
      }
      setCategories((c) => [...c, data.category]);
      setName("");
      router.refresh();
    } catch {
      setError("Error de red al agregar la categoría");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar categoría?")) return;
    setError("");
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo eliminar");
      return;
    }
    setCategories((c) => c.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addCategory} className="flex max-w-lg gap-2">
        <input
          className="magi-input"
          placeholder="Nueva categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="magi-btn" type="submit" disabled={loading}>
          {loading ? "..." : "Agregar"}
        </button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <ul className="space-y-2">
        {categories
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3"
            >
              <span>
                {c.name}{" "}
                <span className="text-xs text-ink-soft">/{c.slug}</span>
              </span>
              <button
                type="button"
                className="text-sm text-accent underline"
                onClick={() => remove(c.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
