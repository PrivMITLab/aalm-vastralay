import "server-only";
import { headers } from "next/headers";
import { getSettingBool } from "./settings";

/**
 * Defence-in-depth for Server Actions / form posts:
 * rejects cross-origin POSTs even if a victim's browser is tricked into
 * submitting to us (classic CSRF + the “paste this action in another tab” trick).
 * Next.js Server Actions already bind to the deployment id, but we verify
 * Origin/Referer ourselves too because some custom API routes accept forms.
 */
export async function assertSameOrigin(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await getSettingBool("security.enforceSameOrigin", true))) return { ok: true };
  const h = await headers();
  const origin = h.get("origin");
  const referer = h.get("referer");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const source = origin ?? referer;
  if (!source || !host) {
    // Same-origin navigation inside the app always sends one of these.
    return { ok: false, error: "Security check failed. Please retry from the page." };
  }
  let sourceHost: string;
  try {
    sourceHost = new URL(source).host;
  } catch {
    return { ok: false, error: "Security check failed. Please retry from the page." };
  }
  // Compare hosts (and ports) case-insensitively; the edge may prefix X-Forwarded-Host.
  if (sourceHost.toLowerCase() !== host.toLowerCase()) {
    return { ok: false, error: "Cross-origin submissions are blocked." };
  }
  return { ok: true };
}

/** Hidden honeypot: real users never fill a visually-hidden field named like a company website. */
export function honeypotFilled(formData: FormData): boolean {
  const value = formData.get("company_website");
  return typeof value === "string" && value.trim().length > 0;
}
