import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateStore } from "@/lib/data/store";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  await updateStore((store) => {
    store.categories = store.categories.filter((c) => c.id !== id);
    store.products = store.products.map((p) =>
      p.category_id === id ? { ...p, category_id: null } : p,
    );
  });
  return NextResponse.json({ ok: true });
}
