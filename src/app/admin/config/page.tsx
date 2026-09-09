import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetSettings } from "@/lib/db";
import { hasStoredMpToken } from "@/lib/mercadopago";

export default async function AdminConfigPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const [settings, mpReady] = await Promise.all([dbGetSettings(), hasStoredMpToken()]);
  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-4xl">Configuración</h1>
      <SettingsForm initial={settings} mpReady={mpReady} />
    </div>
  );
}
