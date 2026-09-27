"use client";

/**
 * VersionBadge — App ka current version aur status badge dikhata hai.
 *
 * - 0.x.x → "Beta" badge (royal maroon + gold design)
 * - 1.x.x+ → "Stable" badge (green design)
 *
 * Version `package.json` se NEXT_PUBLIC_APP_VERSION env var ke through aata hai.
 * (Next.js server-side `package.json` ko import allow karta hai, but client
 *  components ke liye env var safest approach hai.)
 *
 * Usage:
 *   <VersionBadge />                    — compact (footer ke liye)
 *   <VersionBadge showLabel={true} />   — "v0.1.0 · Beta" label ke saath
 */

import { Sparkles, CheckCircle } from "lucide-react";

interface VersionBadgeProps {
  /** Show full "v0.1.0 · Beta" label (default: true) */
  showLabel?: boolean;
  /** Extra Tailwind classes */
  className?: string;
}

/** Parses SemVer major version number from a version string like "0.1.0" */
function getMajorVersion(version: string): number {
  const major = parseInt(version.split(".")[0] ?? "0", 10);
  return isNaN(major) ? 0 : major;
}

export default function VersionBadge({
  showLabel = true,
  className = "",
}: VersionBadgeProps) {
  // NEXT_PUBLIC_APP_VERSION — package.json se next.config.ts inject karta hai
  // Fallback: "0.1.0" (dev environment mein)
  const version =
    process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";

  const major = getMajorVersion(version);
  const isStable = major >= 1;

  // Badge label aur color
  const label = isStable ? "Stable" : "Beta";

  if (!showLabel) {
    // Sirf icon — very compact footer use
    return (
      <span
        aria-label={`Version ${version} — ${label}`}
        title={`v${version} · ${label}`}
        className={`inline-flex items-center gap-1 ${className}`}
      >
        {isStable ? (
          <CheckCircle
            className="h-3 w-3 text-emerald-500"
            aria-hidden="true"
          />
        ) : (
          <Sparkles
            className="h-3 w-3 text-[color:var(--accent)]"
            aria-hidden="true"
          />
        )}
      </span>
    );
  }

  return (
    <span
      aria-label={`App version ${version} — ${label}`}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      {/* Version number */}
      <span className="font-mono text-[10px] text-[color:var(--text-soft)]/70">
        v{version}
      </span>

      {/* Status badge pill */}
      {isStable ? (
        // ✅ Stable (>= 1.0.0) — green pill
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
          <CheckCircle className="h-2.5 w-2.5" aria-hidden="true" />
          Stable
        </span>
      ) : (
        // 🔶 Beta (0.x.x) — royal gold pill matching brand colors
        <span
          className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
          Beta
        </span>
      )}
    </span>
  );
}
