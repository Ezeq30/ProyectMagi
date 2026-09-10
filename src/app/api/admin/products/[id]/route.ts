import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbDeleteProduct, dbSetProductColors, dbUpsertProduct } from "@/lib/db";
import { slugify } from "@/lib/format";
import { MAX_PRODUCT_IMAGES, parseProductColors } from "@/lib/product-colors";

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
    const colors = parseProductColors(body.colors);
    const stockFromColors = colors.reduce((s, c) => s + c.stock, 0);
    await dbUpsertProduct({
      id,
      name: String(body.name),
      slug: String(body.slug || slugify(body.name)),
      description: String(body.description ?? ""),
      price: Number(body.price),
      compare_at: body.compare_at != null ? Number(body.compare_at) : null,
      stock: colors.length ? stockFromColors : Number(body.stock ?? 0),
      images: Array.isArray(body.images)
        ? body.images.map(String).slice(0, MAX_PRODUCT_IMAGES)
        : [],
      category_id: body.category_id || null,
      featured: Boolean(body.featured),
      bestseller: Boolean(body.bestseller),
      active: body.active !== false,
    });
    await dbSetProductColors(id, colors);
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
  try {
    await dbDeleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 },
    );
  }
}
