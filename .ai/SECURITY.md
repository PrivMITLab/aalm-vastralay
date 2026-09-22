# 🛡️ AALM VASTRALAY — SECURITY & DEFENSE CHECKLIST
# Location: .ai/SECURITY.md

## 1. Threat Model & Protections

| Threat | Defense Implemented | Code Location |
|---|---|---|
| **SQL Injection** | Parameterized queries via Drizzle ORM — zero raw string SQL concatenation. | `src/db/` |
| **XSS (Cross-Site Scripting)** | React automatic JSX escaping, no unescaped `dangerouslySetInnerHTML`. | `src/components/` |
| **CSRF (Cross-Site Request Forgery)** | Next.js Server Actions same-origin enforcement + secure cookie attributes. | `src/actions/` |
| **Credential & Key Leaks** | Secrets stored strictly in environment variables; AES-256-GCM encryption for stored keys. | `src/lib/encryption.ts` |
| **Brute-Force & DDoS** | IP-based rate limiting + progressive lockout on failed login attempts. | `src/lib/rate-limit.ts` |
| **Multi-Vendor Data Tampering** | Strict tenant boundaries (`where storeId = ownStore.id`) in all seller actions. | `src/actions/seller.ts` |
| **Customer PII Leakage** | Automated phone and email masking in seller order views and logs. | `src/lib/encryption.ts` |
| **Accidental Data Loss** | Safe clean script explicitly protects categories, coupons, settings, and admin. | `scripts/neon-reset.sql` |

## 2. PII Protection Standards
- Customer phone number is masked: `8434061342` -> `******1342`.
- Customer email is masked: `customer@gmail.com` -> `c***r@gmail.com`.
- Plain text passwords are NEVER stored or logged; Scrypt with unique salt per user is used.
- Administrative operations are recorded in `audit_logs` with actor ID, IP address, and timestamp.
