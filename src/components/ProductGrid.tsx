import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

type Props = {
  title: string;
  products: Product[];
};

export function ProductGrid({ title, products }: Props) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl">{title}</h2>
      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-7">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
