import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

type Props = {
  title: string;
  products: Product[];
};

export function ProductGrid({ title, products }: Props) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl">
        {title}
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
