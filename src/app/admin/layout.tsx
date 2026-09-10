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
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            <Link href="/admin" className="font-[family-name:var(--font-display)] text-xl shrink-0">
              Admin Tortugas
            </Link>
            <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 text-sm whitespace-nowrap sm:mx-0 sm:px-0">
              {[
                ["/admin/productos", "Productos"],
                ["/admin/categorias", "Categorías"],
                ["/admin/cupones", "Cupones"],
                ["/admin/pedidos", "Pedidos"],
                ["/admin/apariencia", "Apariencia"],
                ["/admin/config", "Config"],
                ["/", "Ver tienda"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  target={href === "/" ? "_blank" : undefined}
                  className="rounded-full px-3 py-1.5 text-ink-soft hover:bg-bg-deep hover:text-accent"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <form action="/api/admin/logout" method="post" className="sm:ml-auto">
              <button type="submit" className="text-sm text-accent underline">
                Salir
              </button>
            </form>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</div>
    </div>
  );
}
