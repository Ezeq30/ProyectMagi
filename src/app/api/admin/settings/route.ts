import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetSettings, dbUpdateSettings } from "@/lib/db";
import type { SiteSettings } from "@/lib/types";

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as SiteSettings;
  const current = await dbGetSettings();
  const next: SiteSettings = {
    ...current,
    ...body,
    free_shipping_from: Number(body.free_shipping_from ?? current.free_shipping_from),
    flat_shipping_cost: Number(body.flat_shipping_cost ?? current.flat_shipping_cost),
    theme: body.theme ?? current.theme,
  };
  await dbUpdateSettings(next);
  return NextResponse.json({ ok: true });
}
