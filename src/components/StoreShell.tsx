import { Header } from "./Header";
import { Footer } from "./Footer";
import { PromoBanner } from "./PromoBanner";
import { CartDrawer } from "./CartDrawer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { ThemeStyles } from "./ThemeStyles";
import { getCategories, getSettings } from "@/lib/catalog";

export async function StoreShell({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  return (
    <>
      <ThemeStyles theme={settings.theme} />
      <PromoBanner text={settings.promo_banner} />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} settings={settings} />
      <CartDrawer />
      <WhatsAppFloat />
    </>
  );
}
