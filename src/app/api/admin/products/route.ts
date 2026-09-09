import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbSetProductColors, dbUpsertProduct } from "@/lib/db";
import { slugify } from "@/lib/format";

async function guard() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function parseColors(raw: unknown): { value: string; stock: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { value: item.trim(), stock: 0 };
      }
      if (item && typeof item === "object") {
        const row = item as { value?: unknown; stock?: unknown };
        return {
          value: String(row.value ?? "").trim(),
          stock: Math.max(0, Number(row.stock) || 0),
        };
      }
      return { value: "", stock: 0 };
    })
    .filter((c) => c.value);
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await request.json();
  if (!body.name || body.price == null) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  try {
    const colors = parseColors(body.colors);
    const stockFromColors = colors.reduce((s, c) => s + c.stock, 0);
    const id = await dbUpsertProduct({
      name: String(body.name),
      slug: String(body.slug || slugify(body.name)),
      description: String(body.description ?? ""),
      price: Number(body.price),
      compare_at: body.compare_at != null ? Number(body.compare_at) : null,
      stock: colors.length ? stockFromColors : Number(body.stock ?? 0),
      images: Array.isArray(body.images)
        ? body.images.map(String).slice(0, 5)
        : [],
      category_id: body.category_id || null,
      featured: Boolean(body.featured),
      bestseller: Boolean(body.bestseller),
      active: body.active !== false,
    });
    await dbSetProductColors(id, colors);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 },
    );
  }
}
