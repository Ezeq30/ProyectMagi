import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminLoginPage from "./LoginForm";

export default async function AdminLogin() {
  if (await isAdminAuthenticated()) redirect("/admin");
  return <AdminLoginPage />;
}
