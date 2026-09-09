import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import type { Product } from "@/lib/types";

type Props = {
  title: string;
  products: Product[];
  subtitle?: string;
};

export function ProductGrid({ title, products, subtitle }: Props) {
  if (products.length === 0) return null;
  return (
    <Reveal as="section" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-6 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] tracking-tight sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>}
        </div>
      </div>
      <div className="catalog-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </Reveal>
  );
}
