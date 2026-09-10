import { redirect } from "next/navigation";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSettings } from "@/lib/catalog";
import { dbGetOrders } from "@/lib/db";

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthenticated())) redirect("/login");
  const [orders, settings] = await Promise.all([dbGetOrders(), getSettings()]);
  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-4xl">Pedidos</h1>
      <OrdersAdmin initial={orders} sellerWhatsapp={settings.whatsapp} />
    </div>
  );
}
