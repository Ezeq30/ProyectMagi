import Link from "next/link";
import type { Category } from "@/lib/types";
import type { ProductFilterParams } from "@/lib/product-filters";

type Props = {
  categories: Category[];
  colors: string[];
  filters: ProductFilterParams;
  priceBounds: { min: number; max: number };
};

export function ProductFilters({
  categories,
  colors,
  filters,
  priceBounds,
}: Props) {
  return (
    <form
      method="get"
      action="/productos"
      className="mb-8 grid gap-3 border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
    >
      <label className="block text-sm sm:col-span-2 lg:col-span-1">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Buscar
        </span>
        <input
          className="magi-input"
          type="search"
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Nombre o descripción"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Categoría
        </span>
        <select
          className="magi-input"
          name="cat"
          defaultValue={filters.cat ?? ""}
        >
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Color
        </span>
        <select
          className="magi-input"
          name="color"
          defaultValue={filters.color ?? ""}
          disabled={colors.length === 0}
        >
          <option value="">Todos</option>
          {colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-sm">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Precio min
          </span>
          <input
            className="magi-input"
            type="number"
            name="min"
            min={0}
            step={100}
            placeholder={String(priceBounds.min || 0)}
            defaultValue={filters.min ?? ""}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Precio max
          </span>
          <input
            className="magi-input"
            type="number"
            name="max"
            min={0}
            step={100}
            placeholder={String(priceBounds.max || "")}
            defaultValue={filters.max ?? ""}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-5">
        <button type="submit" className="magi-btn">
          Filtrar
        </button>
        <Link href="/productos" className="magi-btn magi-btn-outline">
          Limpiar
        </Link>
      </div>
    </form>
  );
}
