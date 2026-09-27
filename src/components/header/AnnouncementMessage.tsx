import Link from "next/link";
import React from "react";

export interface Segment {
  type: "text" | "link";
  text: string;
  href?: string;
  isExternal?: boolean;
}

function normalizeHref(rawHref: string): string {
  const h = rawHref.trim();
  if (h.startsWith("http://") || h.startsWith("https://")) return h;
  if (h.startsWith("tel:") || h.startsWith("mailto:")) return h;
  if (h.startsWith("wa.me/")) return `https://${h}`;
  if (h.startsWith("//")) return `https:${h}`;
  if (h.startsWith("/")) return h;
  if (h.startsWith("#")) return h;
  // If it's a 10-digit Indian mobile number
  if (/^(\+91[\s-]?)?[6-9]\d{9}$/.test(h)) {
    const cleanNumber = h.replace(/[\s+-]/g, "");
    return `tel:${cleanNumber}`;
  }
  // If it looks like a relative route without leading slash (e.g. "products" or "category/saree")
  if (/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_\-\?&=#]*)*$/.test(h) && !h.includes(".")) {
    return `/${h}`;
  }
  return h;
}

function isExternal(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
}

export function parseAnnouncement(raw: string): Segment[] {
  if (!raw || !raw.trim()) return [];
  const text = raw.trim();

  // Pattern 1: Arrow syntax: "Offer Text -> /url" or "Text => https://..." or "Text → /url"
  const arrowMatch = text.match(/^(.+?)\s*(?:->|→|=>)\s*([^\s]+)$/);
  if (arrowMatch && arrowMatch[1] && arrowMatch[2]) {
    const label = arrowMatch[1].trim();
    const href = normalizeHref(arrowMatch[2]);
    return [
      {
        type: "link",
        text: label,
        href,
        isExternal: isExternal(href),
      },
    ];
  }

  // Pattern 2: Markdown syntax: "[Label](url)"
  const mdRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  if (mdRegex.test(text)) {
    mdRegex.lastIndex = 0;
    const segments: Segment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mdRegex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchEnd = mdRegex.lastIndex;

      if (matchStart > lastIndex) {
        segments.push({
          type: "text",
          text: text.slice(lastIndex, matchStart),
        });
      }

      const label = match[1];
      const href = normalizeHref(match[2]);
      segments.push({
        type: "link",
        text: label,
        href,
        isExternal: isExternal(href),
      });

      lastIndex = matchEnd;
    }

    if (lastIndex < text.length) {
      segments.push({
        type: "text",
        text: text.slice(lastIndex),
      });
    }

    return segments;
  }

  // Pattern 3: Check for embedded URLs or phone numbers in text (e.g. Call/WhatsApp: 8434061342 or https://...)
  // Regex to match URLs or 10-digit Indian phone numbers
  const tokenRegex = /(https?:\/\/[^\s]+|wa\.me\/[0-9]+|(?:\+91[\s-]?)?[6-9]\d{9})/g;
  const parts: Segment[] = [];
  let currentIdx = 0;
  let tokenMatch: RegExpExecArray | null;

  while ((tokenMatch = tokenRegex.exec(text)) !== null) {
    const start = tokenMatch.index;
    const matchedToken = tokenMatch[0];

    if (start > currentIdx) {
      parts.push({
        type: "text",
        text: text.slice(currentIdx, start),
      });
    }

    const cleanToken = matchedToken.replace(/[\s+-]/g, "");
    const isPhone = /^[6-9]\d{9}$/.test(cleanToken) || /^91[6-9]\d{9}$/.test(cleanToken);

    if (isPhone) {
      // If preceded by WhatsApp, link to WhatsApp; otherwise tel:
      const precedingText = text.slice(Math.max(0, start - 20), start).toLowerCase();
      const isWhatsAppContext = precedingText.includes("whatsapp") || precedingText.includes("wa.me");
      const normalizedPhone = cleanToken.startsWith("91") && cleanToken.length === 12 ? cleanToken : `91${cleanToken}`;
      const href = isWhatsAppContext ? `https://wa.me/${normalizedPhone}` : `tel:${cleanToken.slice(-10)}`;

      parts.push({
        type: "link",
        text: matchedToken,
        href,
        isExternal: isWhatsAppContext,
      });
    } else {
      const href = normalizeHref(matchedToken);
      parts.push({
        type: "link",
        text: matchedToken,
        href,
        isExternal: isExternal(href),
      });
    }

    currentIdx = start + matchedToken.length;
  }

  if (currentIdx < text.length) {
    parts.push({
      type: "text",
      text: text.slice(currentIdx),
    });
  }

  return parts.length > 0 ? parts : [{ type: "text", text }];
}

export default function AnnouncementMessage({ raw }: { raw: string }) {
  const segments = parseAnnouncement(raw);

  return (
    <span className="inline-flex items-center gap-1">
      {segments.map((seg, idx) => {
        if (seg.type === "link" && seg.href) {
          const isInternal = seg.href.startsWith("/") || seg.href.startsWith("#");
          const isPhoneOrMail = seg.href.startsWith("tel:") || seg.href.startsWith("mailto:");

          if (isInternal) {
            return (
              <Link
                key={`seg-${idx}`}
                href={seg.href}
                prefetch={false}
                className="underline decoration-[#D4AF37]/60 underline-offset-4 transition hover:decoration-[#D4AF37] hover:text-white"
              >
                {seg.text}
              </Link>
            );
          }

          return (
            <a
              key={`seg-${idx}`}
              href={seg.href}
              target={isPhoneOrMail ? undefined : "_blank"}
              rel={isPhoneOrMail ? undefined : "noopener noreferrer"}
              className="underline decoration-[#D4AF37]/60 underline-offset-4 transition hover:decoration-[#D4AF37] hover:text-white"
            >
              {seg.text}
            </a>
          );
        }

        return <span key={`seg-${idx}`}>{seg.text}</span>;
      })}
    </span>
  );
}
