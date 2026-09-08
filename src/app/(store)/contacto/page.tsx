import { whatsappUrl } from "@/lib/whatsapp";

export const metadata = { title: "Contacto" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-5xl">Contacto</h1>
      <p className="mt-6 text-ink-soft leading-relaxed">
        ¿Consultas por un producto, envíos o venta mayorista? Magali te responde por WhatsApp.
      </p>
      <a
        href={whatsappUrl("Hola! Quiero consultar por Accesorios Tortugas Online")}
        target="_blank"
        rel="noreferrer"
        className="magi-btn mt-8 inline-flex"
      >
        Escribir al 11 3578-7669
      </a>
      <p className="mt-8 text-sm text-ink-soft">
        También podés usar el botón verde flotante en cualquier página de la tienda.
      </p>
    </div>
  );
}
