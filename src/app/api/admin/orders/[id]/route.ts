import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbUpdateOrderStatus } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const { status } = await request.json();
  await dbUpdateOrderStatus(id, status as OrderStatus);
  return NextResponse.json({ ok: true });
}
