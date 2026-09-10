import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import LoginForm from "@/app/admin/login/LoginForm";

export const metadata = { title: "Login" };

export default async function LoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
}
