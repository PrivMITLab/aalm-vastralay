# 🛡️ AALM VASTRALAY — SECURITY & DEFENSE CHECKLIST
# Location: .ai/SECURITY.md

## 1. Threat Model & Protections

| Threat | Defense Implemented | Code Location |
|---|---|---|
| **SQL Injection** | Parameterized queries via Drizzle ORM — zero raw string SQL concatenation. | `src/db/` |
| **XSS (Cross-Site Scripting)** | React automatic JSX escaping, no unescaped `dangerouslySetInnerHTML`. | `src/components/` |
| **CSRF (Cross-Site Request Forgery)** | Next.js Server Actions same-origin enforcement + secure cookie attributes. | `src/actions/` |
| **Bot Abuse & Automated Spam** | Self-hosted Turnstile Click-to-Solve PoW defense with client Web Worker solving. | `src/components/security/ClickToSolve.tsx`, `src/lib/pow.ts` |
| **Token Replay Attacks** | Atomic single-use challenge store `pow_used` with conflict rejection and hourly pruning. | `src/lib/pow-store.ts`, `src/db/schema.ts` |
| **Inspect Element Form Bypass** | Server actions strictly verify valid PoW signature and payload before execution; unlocking the client button in DevTools fails at the server. | `src/actions/auth.ts`, `orders.ts`, `src/app/api/newsletter/` |
| **Mobile Carrier IP Drift** | IPv4 `/24` (first 3 octets) and IPv6 `/64` prefix hashing allows cellular tower switching while blocking cross-network token transplants. | `src/lib/pow.ts` |
| **Double Click & Order Race** | Atomic re-entry guard hook `useFormLock` disables interactive buttons upon submission. | `src/lib/use-form-lock.ts`, `src/components/SubmitButton.tsx` |
| **IP Spoofing & Rate Limit Bypass** | Strict IPv4/IPv6 regex validation, Cloudflare/Vercel proxy priority, fail-closed on sensitive routes. | `src/lib/rate-limit.ts`, `src/lib/request.ts` |
| **Information Leakage** | Zero stack traces or raw database error messages exposed in responses; generic user messages with server-only logged UUID request IDs. | `src/app/api/**/route.ts` |
| **Credential & Key Leaks** | Secrets stored strictly in environment variables; AES-256-GCM encryption for stored keys. | `src/lib/encryption.ts` |
| **Brute-Force & DDoS** | IP-based rate limiting + progressive lockout on failed login attempts. | `src/lib/rate-limit.ts` |
| **Multi-Vendor Data Tampering** | Strict tenant boundaries (`where storeId = ownStore.id`) in all seller actions. | `src/actions/seller.ts` |
| **Customer PII Leakage** | Automated phone and email masking in seller order views and logs. | `src/lib/masking.ts`, `src/lib/encryption.ts` |
| **Accidental Data Loss** | Safe clean script explicitly protects categories, coupons, settings, and admin. | `scripts/neon-reset.sql` |

## 2. PII Protection Standards
- Customer phone number is masked: `8434061342` -> `8434****42`.
- Customer email is masked: `customer@gmail.com` -> `r**@gmail.com`.
- Plain text passwords are NEVER stored or logged; Scrypt with unique salt per user is used.
- Administrative operations are recorded in `audit_logs` with actor ID, IP address, and timestamp.

## 3. Self-Hosted Turnstile Click-to-Solve PoW Bot Defense
1. **Zero Third-Party Cost & Privacy:**
   - 100% self-hosted PBKDF2/SHA-256 solver running in an inline Web Worker.
   - Zero tracking cookies, zero external API requests to Google or Cloudflare.
2. **5 Display Modes (Configurable in Admin Settings):**
   - `standard`: Cloudflare Turnstile-style card with border, status icon, and live countdown timer.
   - `bar`: Compact inline ribbon for narrow checkout or newsletter forms.
   - `floating`: Pinned bottom-right security badge.
   - `overlay`: High-security modal gate with backdrop blur.
   - `invisible`: Background auto-solve with zero user interaction required.
3. **2 Widget Control Styles:**
   - `checkbox`: Classic Turnstile square check `[ ✓ ]`.
   - `switch`: Modern iOS-style slide toggle `( O )`.
4. **4 Accent Color Themes:**
   - `gold` (Default Royal Aalm Gold `#D4AF37`)
   - `royal-maroon` (Deep Bridal Palette `#722F37`)
   - `emerald` (Festive Emerald `#10B981`)
   - `neutral` (Minimal Modern Zinc / Slate)
