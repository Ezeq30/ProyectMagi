import { redirect } from "next/navigation";

/** Compat: la URL pública de login es /login */
export default function AdminLoginRedirect() {
  redirect("/login");
}
