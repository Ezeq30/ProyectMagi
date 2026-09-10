import type { Category, Product } from "@/lib/types";

export type ProductFilterParams = {
  q?: string;
  cat?: string;
  color?: string;
  min?: number | null;
  max?: number | null;
};

export function parseProductFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ProductFilterParams {
  const one = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const q = (one("q") ?? "").trim();
  const cat = (one("cat") ?? "").trim();
  const color = (one("color") ?? "").trim();
  const minRaw = one("min");
  const maxRaw = one("max");
  const min = minRaw != null && minRaw !== "" ? Number(minRaw) : null;
  const max = maxRaw != null && maxRaw !== "" ? Number(maxRaw) : null;
  return {
    q: q || undefined,
    cat: cat || undefined,
    color: color || undefined,
    min: min != null && Number.isFinite(min) ? min : null,
    max: max != null && Number.isFinite(max) ? max : null,
  };
}

export function collectProductColors(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    for (const v of p.variants ?? []) {
      if (v.name.toLowerCase() === "color" && v.value.trim()) {
        set.add(v.value.trim());
      }
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

export function filterProducts(
  products: Product[],
  filters: ProductFilterParams,
  categories: Category[],
): Product[] {
  let list = products;

  if (filters.q) {
    const needle = filters.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle),
    );
  }

  if (filters.cat) {
    const category = categories.find((c) => c.slug === filters.cat);
    if (category) {
      list = list.filter((p) => p.category_id === category.id);
    } else {
      list = [];
    }
  }

  if (filters.color) {
    const color = filters.color.toLowerCase();
    list = list.filter((p) =>
      (p.variants ?? []).some(
        (v) =>
          v.name.toLowerCase() === "color" &&
          v.value.toLowerCase() === color &&
          v.stock > 0,
      ),
    );
  }

  if (filters.min != null) {
    list = list.filter((p) => p.price >= filters.min!);
  }
  if (filters.max != null) {
    list = list.filter((p) => p.price <= filters.max!);
  }

  return list;
}

export function filtersAreActive(filters: ProductFilterParams): boolean {
  return Boolean(
    filters.q ||
      filters.cat ||
      filters.color ||
      filters.min != null ||
      filters.max != null,
  );
}
