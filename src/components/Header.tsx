"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useCart } from "@/lib/cart/store";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
};

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`nav-link ${active ? "nav-link-active" : ""}`}
    >
      {children}
    </Link>
  );
}

export function Header({ categories }: Props) {
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMenuOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-[color:var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:h-16 sm:gap-6 sm:px-4">
        <button
          type="button"
          className="shrink-0 p-1.5 md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="block h-0.5 w-5 bg-ink mb-1" />
          <span className="block h-0.5 w-5 bg-ink mb-1" />
          <span className="block h-0.5 w-5 bg-ink" />
        </button>

        <Link
          href="/"
          className="min-w-0 shrink-0"
          aria-label="Accesorios Tortugas Online"
          onClick={() => setMenuOpen(false)}
        >
          <span className="sm:hidden">
            <BrandLogo variant="mark" />
          </span>
          <span className="hidden sm:inline">
            <BrandLogo variant="horizontal" />
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <Link
              href="/productos"
              className={`nav-link inline-flex items-center gap-1 ${
                pathname.startsWith("/productos") || pathname.startsWith("/categoria")
                  ? "nav-link-active"
                  : ""
              }`}
              aria-expanded={productsOpen}
            >
              Productos
              <svg
                viewBox="0 0 12 12"
                className={`h-3 w-3 transition ${productsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <path d="M2.5 4.5 6 8l3.5-3.5" />
              </svg>
            </Link>

            <div
              className={`absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 pt-2 transition ${
                productsOpen
                  ? "visible opacity-100"
                  : "invisible opacity-0 pointer-events-none"
              }`}
            >
              <div className="overflow-hidden rounded-lg border border-line bg-[color:var(--card,#fff)] py-1.5 shadow-md">
                <Link
                  href="/productos"
                  className="block px-3.5 py-2 text-[13px] text-ink-soft transition hover:bg-bg-deep hover:text-accent"
                >
                  Ver todos
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categoria/${c.slug}`}
                    className="block px-3.5 py-2 text-[13px] text-ink-soft transition hover:bg-bg-deep hover:text-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <NavLink href="/quienes-somos">Quiénes somos</NavLink>
          <NavLink href="/como-comprar">Cómo comprar</NavLink>
          <NavLink href="/contacto">Contacto</NavLink>
        </nav>

        <button
          type="button"
          onClick={openCart}
          className="relative ml-auto shrink-0 rounded-full border border-ink/15 px-3 py-1.5 text-xs transition hover:border-accent hover:text-accent md:ml-2 sm:text-sm"
          aria-label="Abrir carrito"
        >
          Carrito
          {mounted && count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-white">
              {count}
            </span>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-bg-deep px-4 py-3 md:hidden max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-0.5 text-sm">
            <Link
              href="/productos"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-2.5 font-medium hover:bg-[color:var(--bg)] hover:text-accent"
            >
              Productos
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-md py-2 pl-4 text-ink-soft hover:bg-[color:var(--bg)] hover:text-accent"
              >
                {c.name}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            <Link
              href="/quienes-somos"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-2.5 hover:bg-[color:var(--bg)] hover:text-accent"
            >
              Quiénes somos
            </Link>
            <Link
              href="/como-comprar"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-2.5 hover:bg-[color:var(--bg)] hover:text-accent"
            >
              Cómo comprar
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-2.5 hover:bg-[color:var(--bg)] hover:text-accent"
            >
              Contacto
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
