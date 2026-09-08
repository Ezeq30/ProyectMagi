import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readStore } from "@/lib/data/store";

export default async function AdminConfigPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const store = await readStore();
  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-4xl">Configuración</h1>
      <SettingsForm initial={store.settings} />
    </div>
  );
}
