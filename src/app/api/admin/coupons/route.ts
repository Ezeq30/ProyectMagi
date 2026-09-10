import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetCoupons, dbUpsertCoupon } from "@/lib/db";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const coupons = await dbGetCoupons();
    return NextResponse.json({ coupons });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const coupon = await dbUpsertCoupon({
      id: body.id ? String(body.id) : undefined,
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
