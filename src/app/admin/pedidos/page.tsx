import { redirect } from "next/navigation";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetOrders } from "@/lib/db";

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const orders = await dbGetOrders();
  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-4xl">Pedidos</h1>
      <OrdersAdmin initial={orders} />
    </div>
  );
}
