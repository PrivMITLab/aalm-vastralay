"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Auto-generated user avatar — zero upload hassle.
 *
 * Renders `/api/avatar?seed=` (self-hosted DiceBear `lorelei`, edge-cached
 * 1 year). Pass a stable non-PII seed (e.g. user.id, never email) so the
 * URL carries no personal data into logs/CDN.
 *
 * Fallback is fully local (initial letter tile) — deliberately NOT an
 * external UI-Avatars link, keeping the privacy-first promise (no third
 * party sees our users).
 */
export default function UserAvatar({
  seed,
  name = "A",
  size = 112,
  className,
}: {
  /** Stable identifier, e.g. user.id. Sanitized server-side; max 50 chars. */
  seed: string;
  /** Display name — only its first letter is used, only on fallback. */
  name?: string;
  /** Pixel size (square). */
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const safeSeed = encodeURIComponent((seed || "guest").slice(0, 50));

  if (failed) {
    return (
      <span
        role="img"
        aria-label={name}
        style={{ height: size, width: size }}
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-[#4A148C] font-display text-2xl font-bold text-[#D4AF37]",
          className,
        )}
      >
        {(name || "A").slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/avatar?seed=${safeSeed}`}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={{ height: size, width: size }}
      className={cn("shrink-0 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] object-cover", className)}
    />
  );
}
