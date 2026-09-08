import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ProductGrid } from "@/components/ProductGrid";
import { getCategories, getProducts, getSettings } from "@/lib/catalog";

export default async function HomePage() {
  const [settings, featured, bestsellers, categories] = await Promise.all([
    getSettings(),
    getProducts({ featured: true }),
    getProducts({ bestseller: true }),
    getCategories(),
  ]);

  const mainCategories = categories.filter((c) => c.slug !== "rebajas");

  return (
    <>
      <section className="magi-grain relative min-h-[70vh] sm:min-h-[80vh] md:min-h-[88vh] overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1590874103328-eac38a67437a?auto=format&fit=crop&w=1800&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in srgb, var(--bg) 95%, transparent), color-mix(in srgb, var(--bg) 75%, transparent), transparent)",
          }}
        />
        <div className="relative mx-auto flex min-h-[70vh] sm:min-h-[80vh] md:min-h-[88vh] max-w-6xl flex-col justify-center px-4 py-14 sm:py-20">
          <p className="magi-fade-up text-[11px] sm:text-sm uppercase tracking-[0.28em] text-accent">
            Accesorios Tortugas Online
          </p>
          <h1 className="magi-fade-up-delay mt-3 sm:mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-[1.05] sm:text-5xl md:text-7xl">
            {settings.hero_headline}
          </h1>
          <p className="magi-fade-up-delay-2 mt-4 sm:mt-5 max-w-md text-base sm:text-lg text-ink-soft">
            {settings.hero_sub}
          </p>
          <div className="magi-fade-up-delay-2 mt-6 sm:mt-8 flex flex-wrap gap-3">
            <Link href="/productos" className="magi-btn">
              Ver productos
            </Link>
            <Link href="/categoria/carteras" className="magi-btn magi-btn-outline">
              Ver carteras
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl">
          Categorías
        </h2>
        <p className="mt-2 text-sm sm:text-base text-ink-soft">
          Carteras, bolsos, mochilas, bijou, vasos y más.
        </p>
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {mainCategories.map((c) => (
            <Link
              key={c.id}
              href={`/categoria/${c.slug}`}
              className="product-card flex min-h-20 sm:min-h-24 items-center justify-center rounded-xl border border-line/60 px-3 py-5 text-center text-xs sm:text-sm font-medium tracking-wide transition hover:border-accent hover:text-accent"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <ProductGrid title="Destacados" products={featured} />

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold">Lujo minimalista</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl">
              {settings.about_title}
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">{settings.about_text}</p>
            <Link
              href="/quienes-somos"
              className="mt-6 inline-block text-accent underline-offset-4 hover:underline"
            >
              Conocenos
            </Link>
          </div>
          <div
            className="min-h-72 rounded-sm bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1548036328-c9fa89d128ac?auto=format&fit=crop&w=1200&q=80)",
            }}
          />
        </div>
      </section>

      <ProductGrid title="Más vendidos" products={bestsellers} />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl">Envíos a todo el país</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Calculamos el envío en el checkout según tu dirección.
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
            Escribinos por WhatsApp al 11 3578-7669.
          </p>
        </div>
      </section>

      <NewsletterForm />
    </>
  );
}
