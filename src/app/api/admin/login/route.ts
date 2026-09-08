import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  sessionToken,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "");
  const password = String(body.password ?? "");

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
