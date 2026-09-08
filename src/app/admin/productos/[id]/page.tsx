import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetCategories, dbGetProductById } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const [product, categories] = await Promise.all([
    dbGetProductById(id),
    dbGetCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-4xl">Editar producto</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
