import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { dbAddNewsletter } from "@/lib/db";
import { useSupabaseData } from "@/lib/supabase/admin";

const FILE = path.join(process.cwd(), "data", "newsletter.json");

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  if (useSupabaseData()) {
    await dbAddNewsletter(normalized);
  } else {
    let list: string[] = [];
    try {
      list = JSON.parse(await fs.readFile(FILE, "utf8")) as string[];
    } catch {
      list = [];
    }
    if (!list.includes(normalized)) {
      list.push(normalized);
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
    }
  }

  return NextResponse.json({ ok: true, coupon: "TORTUGA15" });
}
