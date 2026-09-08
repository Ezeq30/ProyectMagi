import { redirect } from "next/navigation";
import { AppearanceForm } from "@/components/admin/AppearanceForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetSettings } from "@/lib/db";

export default async function AdminAppearancePage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const settings = await dbGetSettings();

  return (
    <div>
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-4xl">Apariencia</h1>
      <AppearanceForm initial={settings.theme} />
    </div>
  );
}
