import Link from "next/link";
import { whatsappUrl } from "@/lib/whatsapp";
import type { Category, SiteSettings } from "@/lib/types";

type Props = {
  categories: Category[];
  settings: SiteSettings;
};

export function Footer({ categories, settings }: Props) {
  return (
    <footer className="mt-auto border-t border-line bg-[#2a1f18] text-[#f7f0e8]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl">
            AccesoriosMagi
          </p>
          <p className="mt-3 text-sm text-[#d9c7b3] leading-relaxed">
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
                href={whatsappUrl("Hola Magali! Quiero consultar por AccesoriosMagi")}
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
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-[#d9c7b3]">
        Copyright AccesoriosMagi — {new Date().getFullYear()}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
