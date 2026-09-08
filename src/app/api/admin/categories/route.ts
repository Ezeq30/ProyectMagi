import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbAddCategory } from "@/lib/db";
import { slugify } from "@/lib/format";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: "Falta nombre" }, { status: 400 });

  try {
    const category = await dbAddCategory(String(name), slugify(String(name)));
    return NextResponse.json({ category });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 },
    );
  }
}
