/**
 * 👑 AALM VASTRALAY — ZERO-COST PII DATA MASKING ENGINE
 *
 * Implements strict privacy protection across the marketplace without paid third-party tools.
 * Masks customer phone numbers and email addresses in all administrative and seller list views,
 * preventing accidental visual data leaks and bulk scraping.
 */

/**
 * Masks an Indian mobile number (e.g. "8434061342" -> "8434****42").
 * Preserves the initial routing network digits and ending digits for customer identification.
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || typeof phone !== "string") return "N/A";
  let cleaned = phone.trim().replace(/\D/g, "");

  // Strip leading Indian country code 91 or trunk 0 if 12 or 11 digits
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)}****${cleaned.slice(8)}`;
  }

  if (cleaned.length > 6) {
    const keepStart = Math.min(3, Math.floor(cleaned.length / 3));
    const keepEnd = Math.min(2, Math.floor(cleaned.length / 4));
    const maskedLen = cleaned.length - keepStart - keepEnd;
    return `${cleaned.slice(0, keepStart)}${"*".repeat(maskedLen)}${cleaned.slice(-keepEnd)}`;
  }

  return cleaned.length > 2 ? `${cleaned.slice(0, 1)}***${cleaned.slice(-1)}` : cleaned || "N/A";
}

/**
 * Masks an email address (e.g. "ram@gmail.com" -> "r**@gmail.com", "suheb.alam@example.com" -> "s***m@example.com").
 * Preserves the domain and first character of local part for verification while hiding the full identity.
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== "string") return "N/A";
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex < 0) {
    // If not a valid email, mask safely
    return trimmed.length > 2 ? `${trimmed[0]}${"*".repeat(trimmed.length - 1)}` : "***";
  }
  if (atIndex <= 1) {
    return `${trimmed[0] || "*"}***${trimmed.slice(atIndex)}`;
  }

  const localPart = trimmed.slice(0, atIndex);
  const domainPart = trimmed.slice(atIndex); // includes '@'


  if (localPart.length <= 2) {
    return `${localPart[0]}*${domainPart}`;
  }

  if (localPart.length <= 4) {
    return `${localPart[0]}**${domainPart}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  const maskLength = Math.min(4, localPart.length - 2);
  return `${firstChar}${"*".repeat(maskLength)}${lastChar}${domainPart}`;
}
