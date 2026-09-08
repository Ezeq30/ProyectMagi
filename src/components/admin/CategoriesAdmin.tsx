"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";

export function CategoriesAdmin({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [categories, setCategories] = useState(initial);

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      setCategories((c) => [...c, data.category]);
      setName("");
      router.refresh();
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar categoría?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
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
        <button className="magi-btn" type="submit">
          Agregar
        </button>
      </form>
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
