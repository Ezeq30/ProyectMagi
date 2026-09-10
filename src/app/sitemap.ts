import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [products, categories] = await Promise.all([
    getProducts({ activeOnly: true }),
    getCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/productos",
    "/quienes-somos",
    "/como-comprar",
    "/contacto",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" || path === "/productos" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/productos" ? 0.9 : 0.6,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/categoria/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/productos/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
