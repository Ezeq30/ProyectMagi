import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Productos" };

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductGrid title="Todos los productos" products={products} />;
}
