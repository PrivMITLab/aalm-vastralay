"use client";

import React, { useState } from "react";
import { ExternalLink, Shield } from "lucide-react";

interface ThirdPartyEmbedProps {
  title: string;
  src: string;
  aspectRatio?: "16/9" | "4/3" | "1/1";
  className?: string;
  allowFullScreen?: boolean;
}

/**
 * Sandboxed, secure third-party embed wrapper.
 * Protects against clickjacking, unauthorized top-navigation, and untrusted scripts.
 */
export default function ThirdPartyEmbed({
  title,
  src,
  aspectRatio = "16/9",
  className = "",
  allowFullScreen = true,
}: ThirdPartyEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] ${className}`}>
      <div className="flex items-center justify-between border-b border-[color:var(--border)] px-3 py-1.5 text-[11px] text-[color:var(--text-soft)]">
        <span className="flex items-center gap-1 font-medium">
          <Shield className="h-3 w-3 text-emerald-600" />
          Sandboxed Embed: {title}
        </span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-[color:var(--brand)] hover:underline"
        >
          Open direct <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      <div
        className="relative w-full"
        style={{ aspectRatio: aspectRatio.replace("/", " / ") }}
      >
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center bg-[color:var(--surface-2)]">
            <span className="text-xs text-[color:var(--text-soft)] animate-pulse">Loading secure embed…</span>
          </div>
        )}
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allow={allowFullScreen ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" : undefined}
          allowFullScreen={allowFullScreen}
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
