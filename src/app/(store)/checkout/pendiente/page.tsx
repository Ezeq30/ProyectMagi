import Link from "next/link";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutPendingPage({ searchParams }: Props) {
  const { order } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Pago pendiente</h1>
      <p className="mt-4 text-ink-soft">
        Tu pago está en proceso{order ? ` (pedido ${order})` : ""}. Te avisamos cuando se acredite.
      </p>
      <a
        href={whatsappUrl(`Hola! Tengo un pago pendiente. Pedido: ${order ?? ""}`)}
        className="magi-btn mt-8 inline-flex"
        target="_blank"
        rel="noreferrer"
      >
        Consultar por WhatsApp
      </a>
      <div className="mt-4">
        <Link href="/" className="text-sm underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
