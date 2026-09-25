"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  /** Stable identifier for the user (user ID, username, or email). Max 50 chars. */
  seed: string;
  /** Optional display name or initial for fallback */
  name?: string;
  /** Optional avatar dimension in pixels (default 40px) */
  size?: number;
  /** Optional custom CSS classes (Tailwind) */
  className?: string;
}

/**
 * 👑 Reusable Privacy-First User Avatar Component
 *
 * Renders an avatar generated in-memory via Next.js API route `/api/avatar?seed=...`
 * powered by self-hosted DiceBear (lorelei style).
 *
 * Key Benefits:
 *  - Zero user upload friction (photo upload ka jhanjhat khatam)
 *  - 100% self-hosted & unlimited (no external API calls or rate limits)
 *  - Edge-cached on Vercel for 1 year (`public, max-age=31536000, immutable`)
 *  - Fallback: onError falls back to UI Avatars if DiceBear fails
 */
export default function UserAvatar({
  seed,
  name,
  size = 40,
  className,
}: UserAvatarProps) {
  const safeSeed = encodeURIComponent((seed || "guest").slice(0, 50));
  const [src, setSrc] = useState<string>(`/api/avatar?seed=${safeSeed}`);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const displayName = name || seed || "User";

  const handleError = () => {
    if (!isFallback) {
      setIsFallback(true);
      // Fallback to UI Avatars with brand colors (Royal Maroon #4A148C + Imperial Gold #D4AF37)
      setSrc(
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName
        )}&background=4A148C&color=D4AF37&bold=true&size=128`
      );
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={displayName}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={handleError}
      style={{ width: size, height: size }}
      className={cn(
        "shrink-0 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] object-cover shadow-xs transition-transform duration-200",
        className
      )}
    />
  );
}
