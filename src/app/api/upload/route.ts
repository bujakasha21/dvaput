import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";
import { MAX_IMAGE_BYTES } from "@/lib/constants";

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

const EXT: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nisi prijavljen/a." }, { status: 401 });

  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fajl nije poslan." }, { status: 400 });

  const ext = EXT[file.type];
  if (!ext) return NextResponse.json({ error: "Dozvoljeni su samo JPG, PNG i WEBP." }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Slika je veća od 5 MB." }, { status: 400 });

  const name = `${randomUUID()}.${ext}`;

  // Na Vercelu disk nije trajan, pa slike idu na Vercel Blob. Lokalno ostaju u storage/uploads.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`listings/${name}`, file, { access: "public", contentType: file.type });
    return NextResponse.json({ url: blob.url });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${name}` });
}
