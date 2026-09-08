import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Productos" };

export default async function ProductsPage() {
  const products = await getProducts();

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

  return <ProductGrid title="Todos los productos" products={products} />;
}
