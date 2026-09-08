import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbDeleteCategory } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  await dbDeleteCategory(id);
  return NextResponse.json({ ok: true });
}
