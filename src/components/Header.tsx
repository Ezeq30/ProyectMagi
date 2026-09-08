"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/store";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
};

export function Header({ categories }: Props) {
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-[#f7f0e8]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <button
          type="button"
          className="md:hidden text-ink"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-ink mb-1.5" />
          <span className="block h-0.5 w-6 bg-ink mb-1.5" />
          <span className="block h-0.5 w-6 bg-ink" />
        </button>

        <Link href="/" className="font-[family-name:var(--font-display)] text-2xl md:text-3xl tracking-tight text-ink">
          Accesorios<span className="text-accent">Magi</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-ink-soft">
          <div className="relative group">
            <Link href="/productos" className="hover:text-ink">
              Productos
            </Link>
            <div className="invisible absolute left-0 top-full z-50 min-w-56 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-xl border border-line bg-white p-3 shadow-lg">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categoria/${c.slug}`}
                    className="block rounded-lg px-3 py-2 hover:bg-bg-deep"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/quienes-somos" className="hover:text-ink">
            Quiénes somos
          </Link>
          <Link href="/como-comprar" className="hover:text-ink">
            Cómo comprar
          </Link>
          <Link href="/contacto" className="hover:text-ink">
            Contacto
          </Link>
        </nav>

        <button
          type="button"
          onClick={openCart}
          className="relative rounded-full border border-ink/20 px-3 py-2 text-sm hover:border-accent"
          aria-label="Abrir carrito"
        >
          Carrito
          {mounted && count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] text-white">
              {count}
            </span>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-bg-deep px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/productos" onClick={() => setMenuOpen(false)}>
              Ver todos los productos
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                onClick={() => setMenuOpen(false)}
              >
                {c.name}
              </Link>
            ))}
            <Link href="/quienes-somos" onClick={() => setMenuOpen(false)}>
              Quiénes somos
            </Link>
            <Link href="/como-comprar" onClick={() => setMenuOpen(false)}>
              Cómo comprar
            </Link>
            <Link href="/contacto" onClick={() => setMenuOpen(false)}>
              Contacto
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
