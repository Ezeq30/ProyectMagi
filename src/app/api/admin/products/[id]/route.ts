import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateStore } from "@/lib/data/store";
import { slugify } from "@/lib/format";

type Ctx = { params: Promise<{ id: string }> };

async function guard() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PUT(request: Request, context: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await context.params;
  const body = await request.json();

  try {
    await updateStore((store) => {
      const idx = store.products.findIndex((p) => p.id === id);
      if (idx < 0) throw new Error("No encontrado");
      const slug = String(body.slug || slugify(body.name));
      if (store.products.some((p) => p.slug === slug && p.id !== id)) {
        throw new Error("Slug duplicado");
      }
      store.products[idx] = {
        ...store.products[idx],
        name: String(body.name),
        slug,
        description: String(body.description ?? ""),
        price: Number(body.price),
        compare_at: body.compare_at != null ? Number(body.compare_at) : null,
        stock: Number(body.stock ?? 0),
        images: Array.isArray(body.images) ? body.images.map(String) : [],
        category_id: body.category_id || null,
        featured: Boolean(body.featured),
        bestseller: Boolean(body.bestseller),
        active: body.active !== false,
      };
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await context.params;
  await updateStore((store) => {
    store.products = store.products.filter((p) => p.id !== id);
  });
  return NextResponse.json({ ok: true });
}
