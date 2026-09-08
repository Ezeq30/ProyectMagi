import { getSettings } from "@/lib/catalog";

export const metadata = { title: "Quiénes somos" };

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-5xl">{settings.about_title}</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-soft">{settings.about_text}</p>
      <p className="mt-6 leading-relaxed text-ink-soft">
        AccesoriosMagi nace para acercarte piezas con onda: bijou, carteras y complementos pensados
        para el día a día. Comprás online, pagás con Mercado Pago y nos escribís por WhatsApp cuando
        necesites una mano.
      </p>
    </div>
  );
}
