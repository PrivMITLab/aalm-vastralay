import { createAuthClient } from "better-auth/react";
import { magicLinkClient, emailOTPClient } from "better-auth/client/plugins";

/**
 * 👑 AALM VASTRALAY — BETTER AUTH CLIENT
 *
 * Client-side Better Auth SDK equipped with Magic Link and Email OTP plugins.
 * Use this client in client components ("use client") for passwordless login,
 * email verification, and OTP flows.
 */
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
