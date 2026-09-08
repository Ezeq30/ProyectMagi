import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateStore } from "@/lib/data/store";
import { slugify } from "@/lib/format";

async function guard() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await request.json();
  if (!body.name || body.price == null) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const id = randomUUID();
  const slug = String(body.slug || slugify(body.name));

  try {
    await updateStore((store) => {
      if (store.products.some((p) => p.slug === slug)) {
        throw new Error("Slug duplicado");
      }
      store.products.unshift({
        id,
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
      });
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 },
    );
  }

  return NextResponse.json({ id });
}
