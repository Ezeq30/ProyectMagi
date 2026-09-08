import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateStore } from "@/lib/data/store";
import { slugify } from "@/lib/format";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: "Falta nombre" }, { status: 400 });

  const category = {
    id: randomUUID(),
    name: String(name),
    slug: slugify(String(name)),
    parent_id: null as string | null,
    sort_order: Date.now(),
  };

  await updateStore((store) => {
    store.categories.push(category);
  });

  return NextResponse.json({ category });
}
