import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { PaymentMethodsStrip } from "@/components/PaymentMethodsStrip";
import { whatsappUrl } from "@/lib/whatsapp";
import type { Category, SiteSettings } from "@/lib/types";

type Props = {
  categories: Category[];
  settings: SiteSettings;
};

export function Footer({ categories, settings }: Props) {
  return (
    <footer className="mt-auto border-t border-line bg-bg-deep text-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-3">
        <div>
          <BrandLogo variant="horizontal" showIcon={false} />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
            {settings.about_text}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Categorías
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categoria/${c.slug}`} className="transition hover:text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/productos" className="transition hover:text-ink">
                Ver todos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Contactanos
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li>
              <a
                href={whatsappUrl(
                  "Hola! Quiero consultar por Accesorios Tortugas Online",
                  settings.whatsapp,
                )}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-ink"
              >
                WhatsApp 11 3578-7669
              </a>
            </li>
            <li>
              <Link href="/como-comprar" className="transition hover:text-ink">
                Cómo comprar
              </Link>
            </li>
            <li>
              <Link href="/quienes-somos" className="transition hover:text-ink">
                Quiénes somos
              </Link>
            </li>
          </ul>
          <p className="mt-5 text-sm text-ink-soft">
            Mercado Pago o efectivo con 5% OFF.
          </p>
        </div>
      </div>
      <div className="border-t border-line px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Medios de pago
          </p>
          <PaymentMethodsStrip hideHeading />
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-xs text-ink-soft">
        Copyright Accesorios Tortugas Online — {new Date().getFullYear()}. Todos los
        derechos reservados.
      </div>
    </footer>
  );
}
