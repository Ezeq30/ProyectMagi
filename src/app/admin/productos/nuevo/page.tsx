import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readStore } from "@/lib/data/store";

export default async function NewProductPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const store = await readStore();
  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-4xl">Nuevo producto</h1>
      <ProductForm categories={store.categories} />
    </div>
  );
}
