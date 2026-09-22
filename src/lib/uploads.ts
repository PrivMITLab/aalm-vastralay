import "server-only";

export type UploadResult = { url: string; bytes: number; type: string };

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * persistUpload is only available in self-hosted (Node.js) deployments where
 * the filesystem is writable.  In Cloudflare Workers the `fs` module does not
 * exist, so callers must use ImageKit (or another CDN) for direct uploads.
 *
 * At runtime we lazy-require `fs/promises` and related modules so the Worker
 * bundle does not fail to compile on import.  If the modules are absent the
 * function throws a clear message instead of a cryptic Worker crash.
 */
export async function persistUpload(input: {
  bucket: string;
  data: string;
  mime: string;
}): Promise<UploadResult> {
  // Lazy-load Node.js-only modules to avoid crashing the Cloudflare Worker
  // bundle at import time.
  let fs: typeof import("fs/promises");
  let cryptoMod: typeof import("crypto");
  let pathMod: typeof import("path");

  try {
    fs = await import("fs/promises");
    cryptoMod = await import("crypto");
    pathMod = await import("path");
  } catch {
    throw new Error(
      "Local file uploads are not supported in this deployment. " +
        "Please configure ImageKit for image uploads.",
    );
  }

  const { mkdir, writeFile } = fs;
  const { randomBytes } = cryptoMod;
  const { join, normalize, resolve } = pathMod;

  const ALLOWED = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/svg+xml",
  ]);

  if (!ALLOWED.has(input.mime))
    throw new Error(`Unsupported file type ${input.mime}`);
  const ext = extFromMime(input.mime);
  const hash = randomBytes(8).toString("hex");

  const publicRoot = resolve(process.cwd(), "public");
  const uploadsRoot = resolve(publicRoot, "uploads");
  const segments = input.bucket
    .split("/")
    .map((seg) =>
      seg
        .replace(/[^a-z0-9_-]/gi, "")
        .toLowerCase()
        .slice(0, 40),
    )
    .filter(Boolean)
    .slice(0, 4);
  const dir = resolve(join(uploadsRoot, ...segments));
  if (!dir.startsWith(uploadsRoot)) throw new Error("Upload path escape");
  await mkdir(dir, { recursive: true });

  const filename = `${hash}${ext}`;
  const filepath = join(dir, filename);

  if (!input.data.startsWith("data:"))
    throw new Error("Unsupported upload format");
  const comma = input.data.indexOf(",");
  const raw = comma >= 0 ? input.data.slice(comma + 1) : input.data;
  const buffer = Buffer.from(raw, "base64");
  if (buffer.length === 0) throw new Error("Empty file");
  if (buffer.length > MAX_UPLOAD_BYTES)
    throw new Error("File too large (max 5 MB)");
  if (!looksLikeImage(buffer, input.mime))
    throw new Error("File contents do not match an image");
  await writeFile(filepath, buffer);

  const relative = normalize(filepath)
    .slice(publicRoot.length)
    .replace(/\\/g, "/");
  return { url: relative, bytes: buffer.length, type: input.mime };
}

function looksLikeImage(buf: Buffer, mime: string) {
  if (mime === "image/svg+xml") {
    const text = buf.toString("utf8");
    const isSvg =
      text.trimStart().startsWith("<?xml") ||
      text.trimStart().startsWith("<svg") ||
      text.includes("<svg");
    if (!isSvg) return false;
    if (/<script[\s>]/i.test(text)) return false;
    if (/\bon[a-z]+\s*=/i.test(text)) return false;
    if (/javascript:/i.test(text)) return false;
    if (/<foreignObject[\s>]/i.test(text)) return false;
    return true;
  }
  if (mime === "image/png") return buf[0] === 0x89 && buf[1] === 0x50;
  if (mime === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8;
  if (mime === "image/webp")
    return (
      buf.subarray(0, 4).toString("ascii") === "RIFF" &&
      buf.subarray(8, 12).toString("ascii") === "WEBP"
    );
  if (mime === "image/avif")
    return buf.subarray(4, 8).toString("ascii") === "ftyp";
  return false;
}

function extFromMime(mime: string) {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/avif":
      return ".avif";
    case "image/svg+xml":
      return ".svg";
    default:
      return "";
  }
}
