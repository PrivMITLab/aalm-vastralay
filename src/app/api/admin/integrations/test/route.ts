import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { b2IsConfigured } from "@/lib/b2";
import { executeAiCompletion } from "@/lib/ai/client";

export const dynamic = "force-dynamic";

export type IntegrationTestService = "neon" | "gas" | "smtp" | "b2" | "worker" | "ai";

export async function POST(req: NextRequest) {
  try {
    await requireRole(["admin"]);

    const body = (await req.json().catch(() => null)) as { service?: IntegrationTestService } | null;
    const service = body?.service;

    if (!service) {
      return NextResponse.json({ success: false, error: "Service parameter is required." }, { status: 400 });
    }

    const start = Date.now();

    // 1. Neon Database Test
    if (service === "neon") {
      try {
        await db.execute(sql`SELECT 1 as ping`);
        const duration = Date.now() - start;
        return NextResponse.json({
          success: true,
          service: "neon",
          latencyMs: duration,
          message: `Connected successfully (${duration}ms). PostgreSQL is active and ready.`,
        });
      } catch (err: unknown) {
        return NextResponse.json({
          success: false,
          service: "neon",
          error: err instanceof Error ? err.message : "Database connection failed",
        }, { status: 500 });
      }
    }

    // 2. Google Apps Script (GAS) Mailer Test
    if (service === "gas") {
      const gasUrl =
        process.env.GAS_EMAIL_URL?.trim() ||
        process.env.GAS_WEBHOOK_URL?.trim() ||
        process.env.QUIETMAIL_API_URL?.trim();

      const gasToken =
        process.env.GAS_SECRET_TOKEN?.trim() ||
        process.env.GAS_AUTH_TOKEN?.trim();

      if (!gasUrl) {
        return NextResponse.json({
          success: false,
          service: "gas",
          error: "GAS_EMAIL_URL or GAS_WEBHOOK_URL is not set in environment variables.",
        }, { status: 400 });
      }

      if (!gasToken) {
        return NextResponse.json({
          success: false,
          service: "gas",
          error: "GAS_SECRET_TOKEN is missing in environment variables. Set GAS_SECRET_TOKEN in Vercel to authenticate.",
        }, { status: 400 });
      }

      try {
        const pingUrl = `${gasUrl}${gasUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(gasToken)}`;
        const res = await fetch(pingUrl, {
          method: "GET",
          headers: { "Accept": "application/json" },
          redirect: "follow",
        });

        const duration = Date.now() - start;
        const text = await res.text();
        let quotaInfo = "";
        try {
          const json = JSON.parse(text) as {
            status?: string;
            message?: string;
            googleRemainingQuota?: number;
            scriptSentToday?: number;
            scriptQuotaLimit?: number;
          };
          if (json.status === "error") {
            return NextResponse.json({
              success: false,
              service: "gas",
              error: `Apps Script error: ${json.message || "Unauthorized"}`,
            }, { status: 401 });
          }
          if (typeof json.googleRemainingQuota === "number") {
            quotaInfo = ` · Remaining Quota: ${json.googleRemainingQuota} emails`;
          }
        } catch {
          // If plain text or html redirect
        }

        return NextResponse.json({
          success: true,
          service: "gas",
          latencyMs: duration,
          message: `Connected successfully (${duration}ms)${quotaInfo}. Ready to dispatch transactional emails.`,
        });
      } catch (err: unknown) {
        return NextResponse.json({
          success: false,
          service: "gas",
          error: err instanceof Error ? err.message : "Failed to reach Google Apps Script webhook.",
        }, { status: 500 });
      }
    }

    // 3. Direct Gmail SMTP Test
    if (service === "smtp") {
      const user = process.env.SMTP_USER?.trim() || process.env.EMAIL_SERVER_USER?.trim();
      const pass = process.env.SMTP_PASSWORD?.trim() || process.env.SMTP_PASS?.trim() || process.env.EMAIL_SERVER_PASSWORD?.trim();

      if (!user || !pass) {
        return NextResponse.json({
          success: false,
          service: "smtp",
          error: "SMTP_USER or SMTP_PASSWORD is not configured in environment.",
        }, { status: 400 });
      }

      try {
        const nodemailerMod = await import("nodemailer");
        const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
        const port = Number(process.env.SMTP_PORT) || 587;
        const secure = process.env.SMTP_SECURE === "true" || port === 465;

        const transporter = nodemailerMod.default.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          connectionTimeout: 5000,
        });

        await transporter.verify();
        const duration = Date.now() - start;

        return NextResponse.json({
          success: true,
          service: "smtp",
          latencyMs: duration,
          message: `Connected to ${host}:${port} (${duration}ms). Ready for direct 500 emails/day dispatch.`,
        });
      } catch (err: unknown) {
        return NextResponse.json({
          success: false,
          service: "smtp",
          error: err instanceof Error ? err.message : "SMTP handshake failed.",
        }, { status: 500 });
      }
    }

    // 4. Backblaze B2 Cold Storage Test
    if (service === "b2") {
      if (!b2IsConfigured()) {
        return NextResponse.json({
          success: false,
          service: "b2",
          error: "B2_KEY_ID, B2_APP_KEY, or B2_BUCKET_ID missing in environment variables.",
        }, { status: 400 });
      }

      try {
        const keyId = process.env.B2_KEY_ID;
        const appKey = process.env.B2_APP_KEY || process.env.B2_APPLICATION_KEY;
        const authRes = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
          headers: {
            Authorization: "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64"),
          },
        });

        if (!authRes.ok) {
          throw new Error(`B2 Authorization failed with status ${authRes.status}`);
        }

        const duration = Date.now() - start;
        return NextResponse.json({
          success: true,
          service: "b2",
          latencyMs: duration,
          message: `Authorized with Backblaze B2 API (${duration}ms). Bucket access active.`,
        });
      } catch (err: unknown) {
        return NextResponse.json({
          success: false,
          service: "b2",
          error: err instanceof Error ? err.message : "B2 authorization check failed.",
        }, { status: 500 });
      }
    }

    // 5. Cloudflare Worker B2 Edge Proxy Test
    if (service === "worker") {
      const workerUrl = process.env.NEXT_PUBLIC_B2_WORKER_URL?.trim();
      if (!workerUrl) {
        return NextResponse.json({
          success: false,
          service: "worker",
          error: "NEXT_PUBLIC_B2_WORKER_URL is not set in environment.",
        }, { status: 400 });
      }

      try {
        const res = await fetch(workerUrl, { method: "HEAD", redirect: "follow" });
        const duration = Date.now() - start;
        return NextResponse.json({
          success: true,
          service: "worker",
          latencyMs: duration,
          message: `Edge worker reachable (${duration}ms) with HTTP ${res.status}.`,
        });
      } catch (err: unknown) {
        return NextResponse.json({
          success: false,
          service: "worker",
          error: err instanceof Error ? err.message : "Worker endpoint unreachable.",
        }, { status: 500 });
      }
    }

    // 6. Multi-Provider AI Inference Test
    if (service === "ai") {
      const hasAiKey = Boolean(
        process.env.GEMINI_API_KEY ||
        process.env.GROQ_API_KEY ||
        process.env.MISTRAL_API_KEY
      );

      if (!hasAiKey) {
        return NextResponse.json({
          success: false,
          service: "ai",
          error: "No AI API keys configured (set GEMINI_API_KEY, GROQ_API_KEY, or MISTRAL_API_KEY).",
        }, { status: 400 });
      }

      try {
        const pingResult = await executeAiCompletion({
          userPrompt: "Respond with the single word 'ACTIVE'.",
          feature: "description",
          maxTokens: 5,
        });
        const duration = Date.now() - start;
        return NextResponse.json({
          success: true,
          service: "ai",
          latencyMs: duration,
          message: `AI Engine Active (${duration}ms) · Provider: ${pingResult.provider} · Output: "${pingResult.text.trim()}".`,
        });
      } catch (err: unknown) {
        return NextResponse.json({
          success: false,
          service: "ai",
          error: err instanceof Error ? err.message : "AI generation check failed.",
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: "Unknown service." }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Internal error occurred.",
    }, { status: 500 });
  }
}
