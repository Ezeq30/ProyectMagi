import { PaymentMethodsStrip } from "@/components/PaymentMethodsStrip";
import { formatPrice } from "@/lib/format";
import { getSettings } from "@/lib/catalog";
import { CASH_DISCOUNT_PERCENT } from "@/lib/payment";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata = { title: "Cómo comprar" };

export default async function HowToBuyPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-5xl">Cómo comprar</h1>
      <ol className="mt-8 space-y-5 text-ink-soft leading-relaxed">
        <li>
          <strong className="text-ink">1. Elegí tus productos</strong> — Navegá el catálogo y
          agregalos al carrito. Al elegir, podés pagar con Mercado Pago o en efectivo.
        </li>
        <li>
          <strong className="text-ink">2. Completá el checkout</strong> — Ingresá tus datos y, si
          querés, coordiná el envío con Magali.
        </li>
        <li>
          <strong className="text-ink">3. Mercado Pago</strong> — Tarjetas vinculadas (Visa,
          Mastercard, débito, etc.), transferencia o dinero en cuenta. Precio de lista.
        </li>
        <li>
          <strong className="text-ink">4. Efectivo · {CASH_DISCOUNT_PERCENT}% OFF</strong> — Si
          pagás en efectivo, se aplica {CASH_DISCOUNT_PERCENT}% de descuento sobre el precio
          publicado y coordinás el pago con Magali por WhatsApp.
        </li>
        <li>
          <strong className="text-ink">5. Envío</strong> — El costo de envío se calcula en el
          checkout (desde {formatPrice(settings.flat_shipping_cost)}), o lo acordás sin cargo.
        </li>
        <li>
          <strong className="text-ink">6. Dudas</strong> — Escribinos al{" "}
          <a className="text-accent underline" href={whatsappUrl()} target="_blank" rel="noreferrer">
            WhatsApp 11 3578-7669
          </a>
          .
        </li>
      </ol>

      <div className="mt-10 rounded-xl border border-line bg-white p-5">
        <PaymentMethodsStrip />
      </div>
    </div>
  );
}
