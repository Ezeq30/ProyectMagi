import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbDeleteOrder, dbUpdateOrderStatus } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

const ALLOWED: OrderStatus[] = [
  "pending",
  "paid",
  "shipped",
  "cancelled",
  "refunded",
];

export async function PATCH(request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const { status } = await request.json();
    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    await dbUpdateOrderStatus(id, status as OrderStatus);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo actualizar" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    await dbDeleteOrder(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo eliminar" },
      { status: 400 },
    );
  }
}
