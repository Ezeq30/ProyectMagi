import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbGetSettings, dbUpdateSettings } from "@/lib/db";
import { DEFAULT_THEME } from "@/lib/theme";
import type { ThemeColors } from "@/lib/types";

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const current = await dbGetSettings();
  const theme: ThemeColors = {
    ...DEFAULT_THEME,
    background: (body.theme as ThemeColors)?.background ?? DEFAULT_THEME.background,
    card: (body.theme as ThemeColors)?.card ?? DEFAULT_THEME.card,
  };

  await dbUpdateSettings({ ...current, theme });
  return NextResponse.json({ ok: true, theme });
}
