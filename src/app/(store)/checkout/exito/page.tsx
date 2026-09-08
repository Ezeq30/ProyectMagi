import Link from "next/link";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = { searchParams: Promise<{ order?: string; demo?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order, demo } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">¡Gracias por tu compra!</h1>
      {order && (
        <p className="mt-4 text-ink-soft">
          Número de pedido: <strong>{order}</strong>
        </p>
      )}
      {demo === "1" && (
        <p className="mt-3 text-sm text-ink-soft">
          Pedido registrado en modo demo (Mercado Pago no configurado). Coordiná el pago por WhatsApp.
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={whatsappUrl(
            `Hola Magali! Acabo de comprar en AccesoriosMagi. Pedido: ${order ?? ""}`,
          )}
          target="_blank"
          rel="noreferrer"
          className="magi-btn"
        >
          Avisar por WhatsApp
        </a>
        <Link href="/productos" className="magi-btn magi-btn-outline">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
