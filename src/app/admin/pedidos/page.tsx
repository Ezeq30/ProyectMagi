import { redirect } from "next/navigation";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readStore } from "@/lib/data/store";

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const store = await readStore();
  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-4xl">Pedidos</h1>
      <OrdersAdmin initial={store.orders} />
    </div>
  );
}
