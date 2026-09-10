import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetOrders, dbGetProducts } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { getLowStockRows, LOW_STOCK_THRESHOLD } from "@/lib/stock";
import Link from "next/link";

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/login");
  const [orders, products] = await Promise.all([
    dbGetOrders(),
    dbGetProducts({ includeInactive: true, activeOnly: false }),
  ]);
  const paid = orders.filter((o) => o.status === "paid").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const lowStock = getLowStockRows(products, LOW_STOCK_THRESHOLD);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Panel</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-ink-soft">Productos</p>
          <p className="mt-2 text-3xl font-semibold">{products.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-ink-soft">Pedidos pendientes</p>
          <p className="mt-2 text-3xl font-semibold">{pending}</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-ink-soft">Pedidos pagos</p>
          <p className="mt-2 text-3xl font-semibold">{paid}</p>
        </div>
        <div
          className={`rounded-xl border p-5 ${
            lowStock.length > 0
              ? "border-amber-300 bg-amber-50"
              : "border-line bg-white"
          }`}
        >
          <p className="text-sm text-ink-soft">Stock bajo (≤{LOW_STOCK_THRESHOLD})</p>
          <p className="mt-2 text-3xl font-semibold">{lowStock.length}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/productos/nuevo" className="magi-btn">
          Nuevo producto
        </Link>
        <Link href="/admin/pedidos" className="magi-btn magi-btn-outline">
          Ver pedidos
        </Link>
        <Link href="/admin/cupones" className="magi-btn magi-btn-outline">
          Cupones
        </Link>
      </div>

      {lowStock.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold">Alertas de stock bajo</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Colores o productos con {LOW_STOCK_THRESHOLD} unidades o menos.
          </p>
          <ul className="mt-4 space-y-2">
            {lowStock.slice(0, 12).map((row) => (
              <li
                key={`${row.productId}-${row.label}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm"
              >
                <span>
                  <Link
                    href={`/admin/productos/${row.productId}`}
                    className="font-medium text-accent underline"
                  >
                    {row.productName}
                  </Link>
                  <span className="text-ink-soft"> · {row.label}</span>
                </span>
                <span
                  className={
                    row.stock === 0
                      ? "font-semibold text-red-700"
                      : "font-semibold text-amber-800"
                  }
                >
                  {row.stock === 0 ? "Sin stock" : `${row.stock} u.`}
                </span>
              </li>
            ))}
          </ul>
          {lowStock.length > 12 && (
            <p className="mt-2 text-sm text-ink-soft">
              +{lowStock.length - 12} más en{" "}
              <Link href="/admin/productos" className="underline">
                Productos
              </Link>
              .
            </p>
          )}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold">Últimos pedidos</h2>
        <ul className="mt-4 space-y-2">
          {orders.slice(0, 5).map((o) => (
            <li key={o.id} className="rounded-lg border border-line bg-white px-4 py-3 text-sm">
              {o.order_number} — {o.customer_name} — {formatPrice(o.total)} — {o.status}
            </li>
          ))}
          {orders.length === 0 && (
            <p className="text-ink-soft">Todavía no hay pedidos.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
