import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-[#efe4d6] text-ink">
      {authed && (
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
            <Link href="/admin" className="font-[family-name:var(--font-display)] text-xl">
              AccesoriosMagi Admin
            </Link>
            <nav className="flex flex-wrap gap-3">
              <Link href="/admin/productos">Productos</Link>
              <Link href="/admin/categorias">Categorías</Link>
              <Link href="/admin/pedidos">Pedidos</Link>
              <Link href="/admin/config">Config</Link>
              <Link href="/" target="_blank">
                Ver tienda
              </Link>
            </nav>
            <form action="/api/admin/logout" method="post" className="ml-auto">
              <button type="submit" className="text-accent underline">
                Salir
              </button>
            </form>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
