import "server-only";
import { headers } from "next/headers";
import { clientIp } from "./rate-limit";
import { getSettingBool } from "./settings";

export type RequestMeta = { ip: string; userAgent: string; trustProxy: boolean };

/** Resolves the caller IP + user agent using the admin's proxy-trust setting. */
export async function requestMeta(): Promise<RequestMeta> {
  const h = await headers();
  let trustProxy = true;
  try {
    trustProxy = await getSettingBool("security.trustProxyHeaders", true);
  } catch {
    trustProxy = true;
  }
  return { ip: clientIp(h, trustProxy), userAgent: (h.get("user-agent") ?? "").slice(0, 300), trustProxy };
}
