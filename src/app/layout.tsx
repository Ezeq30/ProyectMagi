import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AccesoriosMagi",
    template: "%s | AccesoriosMagi",
  },
  description:
    "Tienda online de AccesoriosMagi: bijou, carteras y accesorios. Envíos a todo el país y pago con Mercado Pago.",
  openGraph: {
    title: "AccesoriosMagi",
    description: "Bijou, carteras y accesorios seleccionados para vos.",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
