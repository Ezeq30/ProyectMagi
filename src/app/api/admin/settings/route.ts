import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateStore } from "@/lib/data/store";
import type { SiteSettings } from "@/lib/types";

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as SiteSettings;
  await updateStore((store) => {
    store.settings = {
      ...store.settings,
      ...body,
      free_shipping_from: Number(body.free_shipping_from),
      flat_shipping_cost: Number(body.flat_shipping_cost),
    };
  });
  return NextResponse.json({ ok: true });
}
