import { redirect } from "next/navigation";
import { CategoriesAdmin } from "@/components/admin/CategoriesAdmin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readStore } from "@/lib/data/store";

export default async function AdminCategoriesPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const store = await readStore();
  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-4xl">Categorías</h1>
      <CategoriesAdmin initial={store.categories} />
    </div>
  );
}
