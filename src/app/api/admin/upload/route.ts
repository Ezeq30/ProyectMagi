import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dbUploadProductImage } from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function saveLocal(file: File): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const files: File[] = form
      .getAll("files")
      .filter((f): f is File => f instanceof File);
    const single = form.get("file");
    if (single instanceof File) files.push(single);

    if (files.length === 0) {
      return NextResponse.json({ error: "No se envió ninguna imagen" }, { status: 400 });
    }

    const urls: string[] = [];
    for (const file of files) {
      if (!ALLOWED.has(file.type)) {
        return NextResponse.json(
          { error: `Formato no permitido: ${file.type || file.name}` },
          { status: 400 },
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `La imagen ${file.name} supera 8MB` },
          { status: 400 },
        );
      }

      try {
        urls.push(await dbUploadProductImage(file));
      } catch (err) {
        if (err instanceof Error && err.message === "UPLOAD_LOCAL") {
          urls.push(await saveLocal(file));
        } else {
          throw err;
        }
      }
    }

    return NextResponse.json({ urls, url: urls[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 });
  }
}
