import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbDeleteCoupon, dbUpsertCoupon } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const body = await request.json();
    const coupon = await dbUpsertCoupon({
      id,
      code: String(body.code ?? ""),
      percent_off:
        body.percent_off != null && body.percent_off !== ""
          ? Number(body.percent_off)
          : null,
      amount_off:
        body.amount_off != null && body.amount_off !== ""
          ? Number(body.amount_off)
          : null,
      active: body.active !== false,
      min_subtotal: Number(body.min_subtotal ?? 0),
    });
    return NextResponse.json({ coupon });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await dbDeleteCoupon(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 },
    );
  }
}
