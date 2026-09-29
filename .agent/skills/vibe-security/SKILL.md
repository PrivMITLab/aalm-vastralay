---
name: vibe-security
description: Production-grade security playbook covering input validation, API rate limiting, CSRF defense, cryptographic hashing, PII masking, bot defense, and data sanitization. Verified against Aalm Vastralay production implementation.
license: MIT
metadata:
  version: 2.0.0
  category: security-defense
  tags: security, validation, rate-limiting, csrf, cryptography, owasp, pow, pii, bot-defense
---

# Vibe Security Skill — Production Commandments

## 1. Input Validation (Zod — All Server Actions & API Routes)
- Every server action and API endpoint MUST validate input schemas strictly with Zod.
- Strip unexpected fields, enforce regex on phone (`/^[6-9]\d{9}$/`), email, and pincode.
- Reject non-numeric or invalid UPI UTR: `/^[0-9]{12}$/`.

## 2. Brute-Force & DoS Defense
- IP + user-level fixed-window rate limiting (`src/lib/rate-limit.ts`) with 5-minute sweep.
- Strict IPv4/IPv6 format regex validation (`isValidIp`). Malformed IPs → `"unknown"` bucket with strict limits.
- Fail-closed: sensitive routes (auth, OTP, uploads, admin) fail-closed (`ok: false`) if DB rate-limit throws.
- Anti-bot Proof-of-Work (`ClickToSolve.tsx`) with 10 archetypes on all high-risk endpoints.
- Single-use anti-replay store: `pow_used` table with atomic `ON CONFLICT DO NOTHING` insert + 1-hour pruning.
- IPv4 /24 and IPv6 /64 subnet binding for Indian carrier tower drift resilience.

## 3. CSRF & Cross-Origin Defense
- Verify `Origin` and `Host` on all state-changing POST/PUT requests.
- All Server Actions use Next.js built-in CSRF protection via server action tokens.
- Client form buttons locked (`disabled`, `pointer-events-none`) until PoW is solved.

## 4. Zero Information Leakage
- Never surface DB error strings, stack traces, file paths, or env variable names in API responses.
- Return clean, actionable generic errors with internal tracking `X-Request-Id` (`crypto.randomUUID()`).
- `/api/health` → `{ ok: true/false }` only. `/api/diagnostic` → admin-only with `requireRole(["admin"])`.

## 5. PII Masking & Confidentiality
- `maskPhone()`: `9876543210` → `9876****10` — used in Admin/Seller order views.
- `maskEmail()`: `ram@gmail.com` → `r**@gmail.com` — never expose full email in list views.
- PII Avatar seeds: use `user.id` (UUID), NEVER email or name as avatar seed.
- Encrypt sensitive data at rest using AES-256-GCM.

## 6. Security Headers & Edge Middleware
- Edge middleware (`src/middleware.ts`) validates session token structure, UUIDv4 user ID, signature, and expiry.
- Static-asset bypass prevention: protected routes (`/admin`, `/seller`, `/checkout`) cannot be bypassed via `.png` or `.js` extensions.
- API-only `401 JSON` responses (not HTML redirect) for unauthorized API requests.

## 7. Upload & File Security
- `validateUploadMetadata()`: rejects path traversal (`..`, `/`, `\`), enforces MIME allowlist, 5MB cap.
- Magic byte validation (`src/lib/image-inspector.ts`): strict binary inspection for JPEG, PNG, WebP, AVIF, GIF, SVG.
- SSRF defense firewall (`src/lib/security/ssrf.ts`): blocks localhost, RFC 1918 ranges, metadata endpoint.

## 8. Open-Source & Template Safety Rules
- No hardcoded `account_id`, KV IDs, API keys, or secrets in any committed file.
- Cloudflare Worker TOML must use placeholder values — setup script writes actual values at runtime.
- B2 credentials (`B2_KEY_ID`, `B2_APP_KEY`) pipe directly to `wrangler secret put` — never in files/logs.
- No PII (name, phone, email, address, Cloudflare Account ID) in any committed source file.
- **Fail-Closed Zero-Default Secrets Law:** Always retrieve secrets via `getRequiredEnv(key)` from `src/lib/required-env.ts`. Never use inline fallback strings (`|| "default_secret"`, `?? "dev_token"`). In production, missing or empty secrets MUST throw a fatal error.
- **Google Apps Script Webhooks:** Scripts in `scripts/*.gs` must strictly require `PropertiesService.getScriptProperties().getProperty("AUTH_TOKEN")` and fail with 401 Unauthorized if missing or invalid.

