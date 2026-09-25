/**
 * 👑 AALM VASTRALAY — SSRF SECURITY DEFENSE
 * Centralized hostname and IP validator to prevent Server-Side Request Forgery.
 * Blocks:
 *  - Localhost (127.0.0.1, ::1, 0.0.0.0, localhost)
 *  - Cloud metadata (169.254.169.254, metadata.google.internal, etc.)
 *  - RFC 1918 Private Ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
 *  - Internal domains (.local, .internal)
 */

export function isBlockedHostname(hostname: string): boolean {
  if (!hostname || typeof hostname !== "string") return true;
  const h = hostname.toLowerCase().trim();

  // Local loopback
  if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0" || h === "[::1]") return true;

  // Cloud metadata services
  if (h === "169.254.169.254" || h.includes("metadata.google.internal") || h.includes("169.254.")) return true;

  // Private RFC 1918 IPv4
  if (/^10\.\d+\.\d+\.\d+$/.test(h)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(h)) return true;

  // Internal TLDs
  if (h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".lan")) return true;

  return false;
}

export function validateSafeExternalUrl(rawUrl: string): { isValid: boolean; error?: string; url?: URL } {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isValid: false, error: "Invalid URL string provided." };
  }

  try {
    const u = new URL(rawUrl.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { isValid: false, error: "Only http: and https: protocols are permitted." };
    }

    if (isBlockedHostname(u.hostname)) {
      return { isValid: false, error: "Access to private or local network hosts is blocked." };
    }

    return { isValid: true, url: u };
  } catch {
    return { isValid: false, error: "Malformed URL syntax." };
  }
}
