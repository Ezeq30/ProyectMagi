import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetProducts } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const products = await dbGetProducts({ includeInactive: true, activeOnly: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Productos</h1>
        <Link href="/admin/productos/nuevo" className="magi-btn">
          Nuevo
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-bg-deep">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.active ? "Activo" : "Oculto"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/productos/${p.id}`} className="text-accent underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
                  Todavía no hay productos. Creá el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
