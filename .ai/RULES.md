# ================================================================
# 👑 VIBE CODING — MASTER RULES FILE
# Location: .ai/RULES.md
# Yeh file AI ko har session ke shuru mein padhni chahiye
# ================================================================

## SECTION 1: GOLDEN RULES (NEVER BREAK)

1. TypeScript strict mode. NO `any` type. Ever.
2. NO `eslint-disable` comments. Fix the real issue.
3. NO secrets/API keys/passwords in code. Only in .env.local / .env.
4. NO `dangerouslySetInnerHTML` without sanitization.
5. NO trust on user input. Validate on client AND server (Zod).
6. NO database errors, stack traces, or file paths shown to user.
7. NO PII (email, phone, password, address) in plain logs.
8. NO `eval()`, `Function()`, `new Function()`.
9. NO SQL string concatenation. Parameterized queries / ORM only.
10. NO commit of .env, .env.local, node_modules, dist, .next.
11. NO deprecated packages. Run npm audit before adding.
12. NO feature removal without explicit user permission.
13. NO API route without error handling (try/catch + standard JSON error).
14. NO button without loading state. Prevent double submit.
15. NO placeholder comments like "// TODO" or "// implement".
16. NO heavy external UI libraries (Bootstrap, MUI, Chakra, shadcn). Use pure Tailwind + standard accessible HTML.
17. NO paid services. Free tiers only (Neon, Cloudflare, GitHub).
18. NO credit card required at any setup step.
19. NO API route without rate limiting.
20. NO sensitive form without bot protection / rate limiting.
21. NO hardcoded color/size/layout that admin cannot change.
22. NO emoji as icon. Use Lucide React only.
23. NO manual destructive SQL for table creation. Use safe incremental DDL / migrations.
24. NO incomplete documentation. Every doc file must be complete.
25. NO skipping accessibility. Every element keyboard usable (WCAG 2.1 AA).
26. NO skipping SEO. Every public page has metadata + OpenGraph tags.
27. NO skipping PWA. manifest.webmanifest + service worker supported.
28. NO skipping caching. Every GET API cached with invalidation.
29. NO Markdown formatting inside code files.
30. NO Mermaid syntax outside .md files.

---

## SECTION 2: CODE QUALITY RULES

- All functions have clear JSDoc / docstrings.
- All exports have proper TypeScript types.
- All components are functional (no class components).
- All hooks follow React rules (top level only).
- All async operations wrapped in try/catch.
- All user-facing text in English (with Hindi / regional i18n support).
- All lists have empty states (EmptyState component).
- All forms have client & server validation.
- All images have alt text and responsive sizing.
- All buttons have loading states and disabled when pending.
- All errors have user-friendly messages (never raw system errors).
- All magic numbers are named constants.
- All utility functions are pure and testable.
- All types defined in `/types` or dedicated type files.
- All API responses follow the same shape: `{ success: boolean, data?: T, error?: string }`.

---

## SECTION 3: SECURITY RULES

### Client Side:
- No secrets in browser code. `NEXT_PUBLIC_` only for public tokens.
- CSP (Content Security Policy) headers configured.
- CSRF protection on forms & state-changing POST requests.
- Input validation with Zod schemas.
- Sanitize user input before rendering.
- Secure cookies (`HttpOnly`, `Secure`, `SameSite=Lax` or `Strict`).
- No sensitive data (passwords, tokens, raw cards) in localStorage.
- `autocomplete="off"` or appropriate semantic autocomplete on sensitive fields.

### Server Side:
- Rate limiting on all endpoints (`src/lib/rate-limit.ts`).
- Proof-of-work / honeypot bot protection on sensitive forms.
- Parameterized queries only (Drizzle ORM).
- Path traversal prevention (`path.normalize`, boundary validation).
- File upload validation (MIME check, size check, safe filename hash).
- Request size limits (1MB default, 10MB upload).
- Request timeout safeguards.
- Generic error messages to client (no internal database schema leaks).
- Audit logging for all administrative / state changes (`src/lib/audit.ts`).
- Account lockout after consecutive failed logins.

### Authentication:
- Strong password enforcement (min 8-12 chars, upper, lower, number, special).
- Scrypt or Argon2/Bcrypt with high work factor for passwords.
- Session rotation on privilege changes.
- Safe logout and token invalidation.

### Authorization & Multi-Tenant Privacy:
- Role-based access control (`customer`, `seller`, `admin`).
- Strict resource ownership checks (`storeId = currentSellerStore.id`).
- Row-level security scoping in every DB query.
- Admin oversight routes require `requireRole(["admin"])`.

### Data Protection:
- AES-256-GCM authenticated cipher for sensitive data (`src/lib/encryption.ts`).
- PII masking (`maskPhone`, `maskEmail`) in logs, invoices, and seller views.
- No PII in logs, error alerts, or analytics payloads.
- Soft-delete strategy (`is_active = false`) to prevent accidental data loss.

---

## SECTION 4: DATABASE & ZERO-LOSS MIGRATION RULES

1. **Primary Keys:** UUID (`gen_random_uuid()`).
2. **Timestamps:** `TIMESTAMPTZ` with default `now()`.
3. **Data Preservation Rule:** NEVER drop a table or column in production.
4. **Expand & Contract Pattern:**
   - Always add new columns with `DEFAULT` or as nullable (`NULL`).
   - Old code continues to work seamlessly with old data.
   - New code writes to new columns.
   - Deprecated columns are phased out safely without data corruption.
5. **Foreign Keys:** `{table}_id` with explicit `ON DELETE CASCADE` or `ON DELETE SET NULL`.
6. **Indexes:** Performance indexes on foreign keys, status filters, and search columns.
7. **Clean Wipe Safeguard:** Safe reset scripts MUST NEVER delete `categories`, `coupons`, `settings`, `audit_logs`, or admin accounts.

---

## SECTION 5: API RULES

- RESTful endpoints with appropriate HTTP status codes:
  - `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`.
- Consistent response envelope:
  ```json
  { "ok": true, "data": { ... } }
  // OR on error:
  { "ok": false, "error": "Human readable message", "code": "INVALID_INPUT" }
  ```
- Rate limit headers on API responses.
- Server-side Zod validation before database writes.
- Never leak raw stack traces to the caller.

---

## SECTION 6: UI/UX & INDIAN COMMERCE RULES

- Mobile-first responsive (320px up to 4K displays).
- Dark theme default with user toggle option.
- WCAG 2.1 AA accessibility (min tap targets 44x44px, color contrast 4.5:1).
- INR currency formatting (`formatINR`) with Lakhs/Crores grouping.
- 6-digit Indian PIN code validation with delivery estimator.
- Bihar/India ethnic wear sizing (XS to XXL, Free Size, Blouse Stitching).
- WhatsApp inquiry integration with pre-filled product titles and SKU.
- Cash on Delivery (COD) toggle with configurable threshold and fee.

---

## SECTION 7: TESTING & VERIFICATION RULES

- Every module must have automated tests in `tests/`.
- Automated test suites verify:
  1. Encryption & PII security (AES-256-GCM, masking)
  2. Currency formatting & commerce calculations
  3. PIN code validation & sizing logic
  4. Password hashing & role hierarchy
  5. Coupons & category hierarchies
  6. Seller tenant isolation & privacy boundaries
  7. Zero-code admin settings integrity
- Mandatory CI verification command before deployment:
  ```bash
  npm test && npm run typecheck && npm run lint && npm run build
  ```

---

## SECTION 8: WORKFLOW ORDER (EVERY AI TURN)

Whenever starting or continuing a task, the AI agent must follow this exact sequence:

1. Read `.ai/RULES.md` (this file)
2. Read `.ai/CONTEXT.md` (live state & verified configs)
3. Read `.ai/PRD.md` (requirements & features)
4. Read `.ai/ARCHITECTURE.md` (system components)
5. Read `.ai/TODO.md` (pending tasks)
6. Read `.ai/BUGS.md` (known issues to avoid repeating)
7. Execute changes strictly maintaining zero regressions
8. Run automated tests (`npm test`) and typecheck (`npm run typecheck`)
9. Update `.ai/CHANGELOG.md` and `.ai/TODO.md`
10. Update `.ai/SNAPSHOTS/` for long-term memory
