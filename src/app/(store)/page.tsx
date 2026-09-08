import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ProductGrid } from "@/components/ProductGrid";
import { formatPrice } from "@/lib/format";
import { getProducts, getSettings } from "@/lib/catalog";

export default async function HomePage() {
  const [settings, featured, bestsellers] = await Promise.all([
    getSettings(),
    getProducts({ featured: true }),
    getProducts({ bestseller: true }),
  ]);

  return (
    <>
      <section className="magi-grain relative min-h-[88vh] overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f0e8]/95 via-[#f7f0e8]/75 to-transparent" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 py-20">
          <p className="magi-fade-up text-sm uppercase tracking-[0.28em] text-accent">
            AccesoriosMagi
          </p>
          <h1 className="magi-fade-up-delay mt-4 max-w-2xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] md:text-7xl">
            {settings.hero_headline}
          </h1>
          <p className="magi-fade-up-delay-2 mt-5 max-w-md text-lg text-ink-soft">
            {settings.hero_sub}
          </p>
          <div className="magi-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <Link href="/productos" className="magi-btn">
              Ver productos
            </Link>
            <Link href="/categoria/bijou" className="magi-btn magi-btn-outline">
              Explorar bijou
            </Link>
          </div>
        </div>
      </section>

      <ProductGrid title="Destacados" products={featured} />

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold">Desde el corazón</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl">
              {settings.about_title}
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">{settings.about_text}</p>
            <Link href="/quienes-somos" className="mt-6 inline-block text-accent underline-offset-4 hover:underline">
              Conocenos
            </Link>
          </div>
          <div
            className="min-h-72 rounded-sm bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80)",
            }}
          />
        </div>
      </section>

      <ProductGrid title="Más vendidos" products={bestsellers} />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl">Envíos a todo el país</h3>
          <p className="mt-2 text-sm text-ink-soft">
            GRATIS superando los {formatPrice(settings.free_shipping_from)}.
          </p>
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl">Pago seguro</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Aboná con Mercado Pago en cuotas o el medio que prefieras.
          </p>
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl">Atención personalizada</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Escribinos por WhatsApp al 11 3578-7669 para consultas o mayorista.
          </p>
        </div>
      </section>

      <NewsletterForm />
    </>
  );
}
