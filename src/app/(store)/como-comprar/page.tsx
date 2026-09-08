import { formatPrice } from "@/lib/format";
import { getSettings } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata = { title: "Cómo comprar" };

export default async function HowToBuyPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-5xl">Cómo comprar</h1>
      <ol className="mt-8 space-y-5 text-ink-soft leading-relaxed">
        <li>
          <strong className="text-ink">1. Elegí tus productos</strong> — Navegá el catálogo y agregalos
          al carrito.
        </li>
        <li>
          <strong className="text-ink">2. Completá el checkout</strong> — Ingresá tus datos de envío y
          aplicá cupones si tenés.
        </li>
        <li>
          <strong className="text-ink">3. Pagá con Mercado Pago</strong> — Tarjeta, débito u otros medios
          disponibles.
        </li>
        <li>
          <strong className="text-ink">4. Envío</strong> — Gratis desde{" "}
          {formatPrice(settings.free_shipping_from)}. Si no alcanza, el costo es{" "}
          {formatPrice(settings.flat_shipping_cost)}.
        </li>
        <li>
          <strong className="text-ink">5. Dudas</strong> — Escribinos al{" "}
          <a className="text-accent underline" href={whatsappUrl()} target="_blank" rel="noreferrer">
            WhatsApp 11 3578-7669
          </a>
          .
        </li>
      </ol>
    </div>
  );
}
