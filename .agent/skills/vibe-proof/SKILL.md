---
name: vibe-proof
description: Parallel full-stack security and regression audit across frontend, backend, database, and CI/CD configurations. Verified against Aalm Vastralay production implementation.
license: MIT
metadata:
  version: 2.0.0
  category: security-hardening
  tags: vibe-proof, audit, static-analysis, zero-defect, open-source-safety
---

# Vibe Proof Full-Stack Hardening — Parallel Audit Tracks

## Track 1: Frontend Safety
- Verify all `<form>` tags use `useFormLock()` double-submit prevention and `<SubmitButton>` loading indicators.
- Verify no secrets or PII in `NEXT_PUBLIC_*` env vars (only safe public values: site URL, feature flags).
- Ensure all user inputs are sanitized before rendering (no `dangerouslySetInnerHTML` without escapeHtml).
- Verify avatar seeds use `user.id` (UUID), NEVER email, name, or phone.
- Check all images have `alt` text and all buttons have ARIA labels.

## Track 2: Backend & API Safety
- Verify every Server Action has `getCurrentUser()` / `requireRole()` authentication guard.
- Ensure rate limiting (`rateLimit()`) is enforced on all public-facing endpoints.
- Check error handling: no SQL errors, stack traces, or env var names in client responses.
- PoW verification via `shouldEnforcePow()` single source of truth in `src/lib/pow.ts`.
- Verify `/api/bootstrap` is POST-only with `timingSafeEqual` token check.

## Track 3: Database & Migration Safety
- Verify all migrations follow additive-only pattern (`ADD COLUMN IF NOT EXISTS ... DEFAULT`).
- Never DROP tables, columns, or indexes in production migrations.
- Check composite indexes exist on all foreign keys and search columns.
- Verify `audit_logs` table is append-only (no delete, no soft delete).

## Track 4: Open-Source Template Safety
- No real `account_id`, KV namespace IDs, or API keys in any committed `.toml` or config file.
- `.env.local` and `.env` excluded from `.gitignore` — never committed.
- No PII (phone, email, name, address, UPI VPA) hardcoded in source files — only in `.env.local`.
- `wrangler-b2-proxy.toml` must contain only placeholder values (`SETUP_SCRIPT_WILL_FILL_THIS`).

## Track 5: DevOps & CI/CD
- CI workflow (`ci.yml`) must pass TypeScript, ESLint, and all 33+ tests before merge.
- Static analysis: CodeQL, Semgrep SAST, NPM critical audit in `.github/workflows/`.
- Dependabot enabled for both `npm` and GitHub Actions dependency updates.
- No secrets in CI env — use GitHub Encrypted Secrets and Cloudflare encrypted secrets vault.

