import { notFound } from "next/navigation";
import { AddToCartPanel } from "@/components/AddToCartPanel";
import { ProductGallery } from "@/components/ProductGallery";
import { getProductBySlug, getProducts } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Producto" };
}

export async function generateStaticParams() {
  const products = await getProducts({ activeOnly: false });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-14 md:grid-cols-2 md:gap-14">
      <ProductGallery name={product.name} images={product.images} />
      <div className="flex flex-col justify-center md:py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-[11px] sm:tracking-[0.22em]">
          Accesorios Tortugas
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:mt-3 sm:text-4xl md:text-5xl">
          {product.name}
        </h1>
        <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-ink-soft sm:mt-5 sm:text-base">
          {product.description}
        </p>
        <div className="mt-6 sm:mt-8">
          <AddToCartPanel product={product} />
        </div>
      </div>
    </div>
  );
}
