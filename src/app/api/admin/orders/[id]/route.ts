import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateStore } from "@/lib/data/store";
import type { OrderStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const { status } = await request.json();
  await updateStore((store) => {
    const order = store.orders.find((o) => o.id === id);
    if (order) order.status = status as OrderStatus;
  });
  return NextResponse.json({ ok: true });
}
