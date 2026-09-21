import { createReadStream } from "fs";
import { Readable } from "stream";
import { stat } from "fs/promises";
import { join, normalize, resolve } from "path";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

/**
 * Streams files uploaded at RUNTIME to public/uploads. Files in /public are
 * frozen at build time, so uploads created after `next build` would 404 under
 * `next start` without this handler. On Node/VPS/Docker with a persistent
 * volume this makes photo uploads fully self-hosted; on Cloudflare Pages use
 * ImageKit/B2 (the seller form uploads there directly when keys are set).
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  if (!segments?.length || segments.some((s) => s.includes(".."))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const root = resolve(process.cwd(), "public", "uploads");
  const filePath = normalize(join(root, ...segments));
  if (!filePath.startsWith(root)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    const stream = Readable.toWeb(createReadStream(filePath)) as unknown as ReadableStream;
    return new Response(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
