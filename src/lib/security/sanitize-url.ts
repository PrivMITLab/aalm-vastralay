/**
 * sanitize-url.ts
 * Module-level URL sanitizers — CodeQL "DOM text reinterpreted as HTML" fix.
 *
 * WHY module-level: CodeQL taint analysis does NOT recognize functions defined
 * inside React components as sanitizers. Moving them here makes CodeQL treat
 * them as trusted sanitizer functions in the taint flow graph.
 *
 * Rule fixed: js/xss-through-dom (CWE-79)
 * Alerts: #72, #73 — UniversalMediaPicker img src with user-controlled URL
 */

/** Allowlisted protocols for image src attributes */
const SAFE_IMG_PROTOCOLS = new Set(["https:", "http:"]);

/**
 * safeImgSrc — sanitize a user-supplied URL before using as <img src>.
 *
 * Blocks: javascript:, data:, vbscript:, blob: (from user input),
 *         and any other non-http/https protocol.
 *
 * Returns: the original URL string if safe, or `undefined` (React will
 *          omit the attribute entirely — no XSS possible).
 *
 * Usage:
 *   <img src={safeImgSrc(userInput)} />
 *   — when safeImgSrc returns undefined, React does not set src at all.
 */
export function safeImgSrc(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();

  // CodeQL PrefixStringSanitizer: explicitly verify startsWith safe protocol
  if (!trimmed.startsWith("https://") && !trimmed.startsWith("http://")) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.href;
    }
  } catch {
    // Malformed URL — not safe
  }
  return undefined;
}

/**
 * safeHref — sanitize a user-supplied URL before using as <a href>.
 * Blocks javascript: and other non-http/https/mailto/tel protocols.
 */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();

  const isAllowedPrefix =
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:");

  if (!isAllowedPrefix) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    const allowed = new Set(["https:", "http:", "mailto:", "tel:"]);
    if (allowed.has(parsed.protocol)) {
      return parsed.href;
    }
  } catch {
    // Malformed URL — not safe
  }
  return undefined;
}
