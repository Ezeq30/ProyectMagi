import { redirect } from "next/navigation";
import { CouponsAdmin } from "@/components/admin/CouponsAdmin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetCoupons } from "@/lib/db";

export default async function AdminCouponsPage() {
  if (!(await isAdminAuthenticated())) redirect("/login");
  const coupons = await dbGetCoupons();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Cupones</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Creá, activá o desactivá códigos de descuento para el checkout.
      </p>
      <div className="mt-6">
        <CouponsAdmin initial={coupons} />
      </div>
    </div>
  );
}
