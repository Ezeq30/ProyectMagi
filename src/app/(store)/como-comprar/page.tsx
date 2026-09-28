import { PaymentMethodsStrip } from "@/components/PaymentMethodsStrip";
import { formatPrice } from "@/lib/format";
import { getSettings } from "@/lib/catalog";
import { TRANSFER_DISCOUNT_PERCENT } from "@/lib/payment";
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
          agregalos al carrito. Podés pagar con Mercado Pago, por transferencia o en efectivo
          en Pago Fácil / Rapipago.
        </li>
        <li>
          <strong className="text-ink">2. Completá el checkout</strong> — Ingresá tus datos y, si
          querés, coordiná el envío con Magali.
        </li>
        <li>
          <strong className="text-ink">3. Mercado Pago</strong> — Tarjetas vinculadas (Visa,
          Mastercard, débito, etc.) o dinero en cuenta. Precio de lista.
        </li>
        <li>
          <strong className="text-ink">4. Transferencia · {TRANSFER_DISCOUNT_PERCENT}% OFF</strong> —
          Se aplica {TRANSFER_DISCOUNT_PERCENT}% de descuento sobre el precio publicado. Al
          confirmar el pedido te mostramos alias y CBU para copiar, y después enviás el
          comprobante por WhatsApp.
        </li>
        <li>
          <strong className="text-ink">5. Efectivo · Pago Fácil o Rapipago</strong> — Elegís la
          sucursal, ingresás tu DNI y te generamos un cupón (vence en 3 días). Cuando lo pagás, el
          pedido se confirma solo. Precio de lista.
        </li>
        <li>
          <strong className="text-ink">6. Envío</strong> — El costo de envío se calcula en el
          checkout (desde {formatPrice(settings.flat_shipping_cost)}), o lo acordás sin cargo.
        </li>
        <li>
          <strong className="text-ink">7. Dudas</strong> — Escribinos al{" "}
          <a className="text-accent underline" href={whatsappUrl()} target="_blank" rel="noreferrer">
            WhatsApp 11 3578-7669
          </a>
          .
        </li>
      </ol>

      <div className="mt-10 rounded-xl border border-line bg-card p-5">
        <PaymentMethodsStrip />
      </div>
    </div>
  );
}
