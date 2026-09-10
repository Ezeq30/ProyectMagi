import Image from "next/image";
import Link from "next/link";
import { HeroSlider } from "@/components/HeroSlider";
import { HomeHeroCopy } from "@/components/HomeHeroCopy";
import { ProductGrid } from "@/components/ProductGrid";
import { Reveal } from "@/components/Reveal";
import { getCategories, getProducts, getSettings } from "@/lib/catalog";

export default async function HomePage() {
  const [settings, featured, bestsellers, categories] = await Promise.all([
    getSettings(),
    getProducts({ featured: true }),
    getProducts({ bestseller: true }),
    getCategories(),
  ]);

  const mainCategories = categories.filter((c) => c.slug !== "rebajas");
  const aboutImage =
    settings.hero_slides[0] ?? "/hero/lima-backpack.jpg";

  return (
    <>
      <section className="grid grid-cols-1 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-2">
        <HomeHeroCopy
          headline={settings.hero_headline}
          sub={settings.hero_sub}
        />
        <div className="relative order-1 h-[min(52vh,420px)] min-h-[240px] sm:h-[min(55vh,520px)] lg:order-2 lg:h-auto lg:min-h-[calc(100svh-7rem)]">
          <HeroSlider
            images={settings.hero_slides}
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </section>

      <Reveal as="section" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20" from="left">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-10">
          <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] tracking-tight sm:text-4xl">
            Colecciones
          </h2>
          <Link
            href="/productos"
            className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink sm:text-[11px] sm:tracking-[0.16em]"
          >
            Ver catálogo
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
          {mainCategories.map((c, i) => (
            <Reveal
              key={c.id}
              as="div"
              from="up"
              delay={0.04 * i}
              className="h-full"
            >
              <Link
                href={`/categoria/${c.slug}`}
                className="group flex min-h-[4.5rem] h-full flex-col items-center justify-center border border-line bg-card px-2 py-4 text-center transition hover:border-ink hover:shadow-[var(--shadow)] sm:min-h-28 sm:px-3 sm:py-6"
              >
                <span className="text-[10px] font-semibold uppercase leading-snug tracking-[0.12em] text-ink transition group-hover:text-accent sm:text-xs sm:tracking-[0.16em]">
                  {c.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <ProductGrid
        title="Destacados"
        subtitle="Piezas seleccionadas de la temporada"
        products={featured}
      />

      <Reveal as="section" className="border-y border-line bg-bg-deep" from="right">
        <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-2 md:items-stretch">
          <div className="relative min-h-[16rem] sm:min-h-80 md:min-h-[28rem]">
            <Image
              src={aboutImage}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center px-4 py-12 sm:px-10 sm:py-14 lg:px-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              La marca
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl md:text-5xl">
              {settings.about_title}
            </h2>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-ink-soft sm:text-base">
              {settings.about_text}
            </p>
            <Link
              href="/quienes-somos"
              className="mt-8 inline-flex w-fit text-[11px] font-semibold uppercase tracking-[0.16em] text-ink underline-offset-4 hover:underline"
            >
              Conocenos
            </Link>
          </div>
        </div>
      </Reveal>

      <ProductGrid
        title="Más vendidos"
        subtitle="Lo que más eligen nuestras clientas"
        products={bestsellers}
      />

      <Reveal as="section" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20" from="up">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-3 md:gap-8">
          {[
            {
              title: "Envíos a todo el país",
              body: "Calculamos el envío en el checkout según tu dirección.",
            },
            {
              title: "Pago seguro",
              body: "Mercado Pago o efectivo con 5% de descuento.",
            },
            {
              title: "Atención personalizada",
              body: "Escribinos por WhatsApp al 11 3578-7669.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} as="div" from="up" delay={0.08 * i}>
              <div className="border-t border-line pt-5 sm:pt-6">
                <h3 className="font-[family-name:var(--font-display)] text-xl tracking-tight sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:mt-3">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </>
  );
}
