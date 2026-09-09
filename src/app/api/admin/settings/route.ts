import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetSettings, dbUpdateSettings } from "@/lib/db";
import { hasStoredMpToken, saveMpAccessToken } from "@/lib/mercadopago";
import type { SiteSettings } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const mpReady = await hasStoredMpToken();
  return NextResponse.json({ mpReady });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const current = await dbGetSettings();
  const next: SiteSettings = {
    ...current,
    ...body,
    free_shipping_from: Number(body.free_shipping_from ?? current.free_shipping_from),
    flat_shipping_cost: Number(body.flat_shipping_cost ?? current.flat_shipping_cost),
    theme: body.theme ?? current.theme,
  };
  await dbUpdateSettings(next);

  if (typeof body.mp_access_token === "string" && body.mp_access_token.trim()) {
    await saveMpAccessToken(body.mp_access_token);
  }

  return NextResponse.json({ ok: true, mpReady: await hasStoredMpToken() });
}
