import type { Metadata } from "next";
import Link from "next/link";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductGrid } from "@/components/ProductGrid";
import { getCategories, getProducts } from "@/lib/catalog";
import {
  collectProductColors,
  filterProducts,
  filtersAreActive,
  parseProductFilters,
} from "@/lib/product-filters";

export const metadata: Metadata = { title: "Productos" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseProductFilters(params);
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const colors = collectProductColors(products);
  const prices = products.map((p) => p.price);
  const priceBounds = {
    min: prices.length ? Math.min(...prices) : 0,
    max: prices.length ? Math.max(...prices) : 0,
  };

  const filtered = filterProducts(products, filters, categories);
  const active = filtersAreActive(filters);

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Productos</h1>
        <p className="mt-4 text-ink-soft">
          Pronto vas a ver el catálogo acá. Mientras tanto, escribinos por WhatsApp.
        </p>
        <Link href="/contacto" className="magi-btn mt-8 inline-flex">
          Contacto
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
      <ProductFilters
        categories={categories}
        colors={colors}
        filters={filters}
        priceBounds={priceBounds}
      />

      {filtered.length === 0 ? (
        <div className="pb-16 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl">
            Sin resultados
          </h1>
          <p className="mt-3 text-ink-soft">
            Probá con otra búsqueda o{" "}
            <Link href="/productos" className="text-accent underline">
              limpiá los filtros
            </Link>
            .
          </p>
        </div>
      ) : (
        <ProductGrid
          title={active ? "Resultados" : "Todos los productos"}
          subtitle={
            active
              ? `${filtered.length} producto${filtered.length === 1 ? "" : "s"}`
              : "Catálogo completo · stock real"
          }
          products={filtered}
        />
      )}
    </div>
  );
}
