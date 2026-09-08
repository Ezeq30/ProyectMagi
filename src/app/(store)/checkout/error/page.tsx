import Link from "next/link";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutErrorPage({ searchParams }: Props) {
  const { order } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">No se pudo completar el pago</h1>
      <p className="mt-4 text-ink-soft">
        Podés intentar de nuevo o escribirnos por WhatsApp
        {order ? ` (pedido ${order})` : ""}.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/checkout" className="magi-btn">
          Reintentar
        </Link>
        <a
          href={whatsappUrl(`Hola! Tuve un problema con el pago. Pedido: ${order ?? ""}`)}
          className="magi-btn magi-btn-outline"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
