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
    default: "Accesorios Tortugas Online",
    template: "%s | Accesorios Tortugas Online",
  },
  description:
    "Accesorios Tortugas Online — bags & handbags: carteras, bolsos y bandoleras. Envíos a todo el país y pago con Mercado Pago.",
  openGraph: {
    title: "Accesorios Tortugas Online",
    description: "Bags & handbags seleccionados para vos.",
    locale: "es_AR",
    type: "website",
  },
  icons: {
    icon: "/logo-accesorios-tortugas.jpg",
    apple: "/logo-accesorios-tortugas.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
