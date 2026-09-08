import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { whatsappUrl } from "@/lib/whatsapp";
import type { Category, SiteSettings } from "@/lib/types";

type Props = {
  categories: Category[];
  settings: SiteSettings;
};

export function Footer({ categories, settings }: Props) {
  return (
    <footer className="mt-auto border-t border-line bg-[#3a342c] text-[#f7f4ef]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:py-14 md:grid-cols-3">
        <div>
          <BrandLogo variant="horizontal" inverted />
          <p className="mt-5 text-sm text-[#d8d0c4] leading-relaxed">
            {settings.about_text}
          </p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-gold">Categorías</p>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categoria/${c.slug}`} className="hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/productos" className="hover:text-gold">
                Ver todos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-gold">Contactanos</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={whatsappUrl(
                  "Hola! Quiero consultar por Accesorios Tortugas Online",
                )}
                target="_blank"
                rel="noreferrer"
                className="hover:text-gold"
              >
                WhatsApp 11 3578-7669
              </a>
            </li>
            <li>
              <Link href="/como-comprar" className="hover:text-gold">
                Cómo comprar
              </Link>
            </li>
            <li>
              <Link href="/quienes-somos" className="hover:text-gold">
                Quiénes somos
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-[#d8d0c4]">
        Copyright Accesorios Tortugas Online — {new Date().getFullYear()}. Todos los
        derechos reservados.
      </div>
    </footer>
  );
}
