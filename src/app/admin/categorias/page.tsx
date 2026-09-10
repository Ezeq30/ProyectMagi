import { redirect } from "next/navigation";
import { CategoriesAdmin } from "@/components/admin/CategoriesAdmin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetCategories } from "@/lib/db";

export default async function AdminCategoriesPage() {
  if (!(await isAdminAuthenticated())) redirect("/login");
  const categories = await dbGetCategories();
  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-4xl">Categorías</h1>
      <CategoriesAdmin initial={categories} />
    </div>
  );
}
