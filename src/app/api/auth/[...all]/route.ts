import { auth } from "@/lib/better-auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * 👑 AALM VASTRALAY — BETTER AUTH API ROUTE HANDLER
 * Catch-all handler for all Better Auth endpoints:
 * - /api/auth/sign-in/email
 * - /api/auth/sign-up/email
 * - /api/auth/sign-out
 * - /api/auth/verify-email
 * - /api/auth/forget-password
 * - /api/auth/reset-password
 * - /api/auth/magic-link
 * - /api/auth/email-otp
 */
export const { POST, GET } = toNextJsHandler(auth.handler);
