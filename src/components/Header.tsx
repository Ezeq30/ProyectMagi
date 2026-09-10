"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { HeaderSearch } from "@/components/HeaderSearch";
import { useThemeMode } from "@/components/ThemeProvider";
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
      <span className="nav-link-label">{children}</span>
    </Link>
  );
}

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`nav-chevron ${open ? "nav-chevron-open" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useThemeMode();
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-ink transition hover:border-ink"
      aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
        </svg>
      )}
    </button>
  );
}

export function Header({ categories }: Props) {
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const pathname = usePathname();
  const productsActive =
    pathname.startsWith("/productos") || pathname.startsWith("/categoria");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMenuOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[color:var(--bg)]/90 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-[4.25rem] sm:gap-4 sm:px-6">
        <button
          type="button"
          className="shrink-0 p-1.5 lg:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="mb-1 block h-px w-5 bg-ink" />
          <span className="mb-1 block h-px w-5 bg-ink" />
          <span className="block h-px w-5 bg-ink" />
        </button>

        <Link
          href="/"
          className="min-w-0 shrink truncate"
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

        <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <Link
              href="/productos"
              className={`nav-link ${productsActive ? "nav-link-active" : ""}`}
              aria-expanded={productsOpen}
              aria-haspopup="menu"
            >
              <span className="nav-link-label">Productos</span>
              <Chevron open={productsOpen} />
            </Link>

            <div
              className={`absolute left-0 top-full z-50 min-w-[12rem] pt-2 transition ${
                productsOpen
                  ? "visible opacity-100"
                  : "invisible pointer-events-none opacity-0"
              }`}
              role="menu"
            >
              <div className="overflow-hidden border border-line bg-card py-1 shadow-[var(--shadow)]">
                <Link
                  href="/productos"
                  role="menuitem"
                  className="block px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] text-ink-soft transition hover:bg-bg-deep hover:text-ink"
                >
                  Ver todos
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categoria/${c.slug}`}
                    role="menuitem"
                    className="block px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] text-ink-soft transition hover:bg-bg-deep hover:text-ink"
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

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-3">
          <HeaderSearch />
          <ThemeToggle />
          <button
            type="button"
            onClick={openCart}
            className="relative flex h-9 items-center gap-2 border border-line px-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition hover:border-ink sm:px-3"
            aria-label="Abrir carrito"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 7h15l-1.5 9H8L6 7z" />
              <path d="M6 7 5 3H2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {mounted && count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto border-t border-line bg-bg-deep px-4 py-4 lg:hidden">
          <div className="mb-3">
            <HeaderSearch compact />
          </div>
          <div className="flex flex-col gap-0.5 text-sm">
            <Link
              href="/productos"
              onClick={() => setMenuOpen(false)}
              className="rounded-sm px-2 py-2.5 font-medium uppercase tracking-[0.1em] hover:bg-bg hover:text-accent"
            >
              Productos
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-sm py-2 pl-4 text-ink-soft hover:bg-bg hover:text-ink"
              >
                {c.name}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            <Link
              href="/quienes-somos"
              onClick={() => setMenuOpen(false)}
              className="rounded-sm px-2 py-2.5 uppercase tracking-[0.1em] hover:bg-bg"
            >
              Quiénes somos
            </Link>
            <Link
              href="/como-comprar"
              onClick={() => setMenuOpen(false)}
              className="rounded-sm px-2 py-2.5 uppercase tracking-[0.1em] hover:bg-bg"
            >
              Cómo comprar
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMenuOpen(false)}
              className="rounded-sm px-2 py-2.5 uppercase tracking-[0.1em] hover:bg-bg"
            >
              Contacto
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
