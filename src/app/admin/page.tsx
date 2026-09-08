import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readStore } from "@/lib/data/store";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const store = await readStore();
  const paid = store.orders.filter((o) => o.status === "paid").length;
  const pending = store.orders.filter((o) => o.status === "pending").length;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Panel</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-ink-soft">Productos</p>
          <p className="mt-2 text-3xl font-semibold">{store.products.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-ink-soft">Pedidos pendientes</p>
          <p className="mt-2 text-3xl font-semibold">{pending}</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-ink-soft">Pedidos pagos</p>
          <p className="mt-2 text-3xl font-semibold">{paid}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/productos/nuevo" className="magi-btn">
          Nuevo producto
        </Link>
        <Link href="/admin/pedidos" className="magi-btn magi-btn-outline">
          Ver pedidos
        </Link>
      </div>
      <div className="mt-10">
        <h2 className="text-xl font-semibold">Últimos pedidos</h2>
        <ul className="mt-4 space-y-2">
          {store.orders.slice(0, 5).map((o) => (
            <li key={o.id} className="rounded-lg border border-line bg-white px-4 py-3 text-sm">
              {o.order_number} — {o.customer_name} — {formatPrice(o.total)} — {o.status}
            </li>
          ))}
          {store.orders.length === 0 && (
            <p className="text-ink-soft">Todavía no hay pedidos.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
