---
name: vibe-security-audit
description: 30-Point automated and manual security audit checklist for vibe-coded and AI-generated fullstack systems.
license: MIT
metadata:
  version: 1.0.0
  category: security-audit
  tags: audit, pentest, owasp, vulnerability-scan, hardening
---

# 30-Point Vibe Security Audit Checklist

## Group 1: Authentication & Session Management
1. Passwords hashed using modern memory-hard cipher (Scrypt or Argon2/Bcrypt cost 12).
2. Session cookies configured with `HttpOnly`, `Secure`, `SameSite=Lax/Strict`.
3. Session rotation on privilege upgrade / password reset.
4. Account lockout or progressive delay after 5 consecutive failed attempts.
5. Inactive sessions expire gracefully.

## Group 2: Access Control & Authorization
6. Tenant isolation: Sellers cannot query or mutate records from foreign stores.
7. Admin route protection enforced in Edge middleware and re-verified on server action execution.
8. IDOR protection: Customers can only view their own orders and addresses.
9. Privilege escalation prevention: Role modification restricted strictly to super admin.

## Group 3: Input Validation & Injection Defense
10. SQL parameterization: Zero string concatenation in database queries (Drizzle ORM).
11. XSS defense: Automatic React JSX escaping, zero raw unescaped HTML injections.
12. Shell injection defense: Zero dynamic `exec()` or unsanitized shell spawns.
13. Path traversal defense: Uploaded filenames sanitized using strict alphanumeric UUIDs.

## Group 4: Cryptography & Secrets Management
14. Zero hardcoded secrets, API keys, or private tokens in git repository.
15. Authenticated AES-256-GCM cipher for stored credentials.
16. Webhook signatures validated using constant-time comparison (`timingSafeEqual`).

## Group 5: Network, HTTP & Edge Security
17. Content Security Policy (CSP) blocking unauthorized script injection and framing.
18. Anti-clickjacking headers (`X-Frame-Options: SAMEORIGIN`).
19. Rate limiting on all `/api/*` endpoints.
20. Proof-of-work challenge enabled on checkout and authentication forms.
21. Strict CORS and CSRF verification on form submissions.
