import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartPanel } from "@/components/AddToCartPanel";
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

  const image = product.images[0] ?? "https://placehold.co/800x1000/c4a574/f7f0e8/png?text=Magi";

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-deep">
        <Image src={image} alt={product.name} fill className="object-cover" priority sizes="50vw" />
      </div>
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-gold">AccesoriosMagi</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl md:text-5xl">
          {product.name}
        </h1>
        <p className="mt-5 leading-relaxed text-ink-soft">{product.description}</p>
        <div className="mt-8">
          <AddToCartPanel product={product} />
        </div>
      </div>
    </div>
  );
}
