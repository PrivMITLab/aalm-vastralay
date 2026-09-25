/**
 * 👑 AALM VASTRALAY — IMAGE INSPECTOR & MIME UTILITIES
 * Pure, environment-agnostic magic-byte validator and file extension resolver.
 */

export function looksLikeImage(buf: Buffer, mime: string): boolean {
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
    if (/<animate[\s>/]/i.test(text)) return false;
    if (/data:text\/html/i.test(text)) return false;
    if (/<!ENTITY/i.test(text)) return false;
    return true;
  }
  if (mime === "image/gif") return buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46;
  if (mime === "image/png") return buf[0] === 0x89 && buf[1] === 0x50;
  if (mime === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8;
  if (mime === "image/webp") {
    return (
      buf.subarray(0, 4).toString("ascii") === "RIFF" &&
      buf.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  if (mime === "image/avif") {
    return buf.subarray(4, 8).toString("ascii") === "ftyp";
  }
  return false;
}

export function extFromMime(mime: string): string {
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
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}
