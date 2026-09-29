# ================================================================
# 👑 VIBE CODING — MASTER RULES FILE
# Location: .ai/RULES.md
# Yeh file AI ko har session mein padhni chahiye
# ================================================================

## SECTION 1: GOLDEN RULES (NEVER BREAK)

1. TypeScript strict mode. NO `any` type. Ever. Fix underlying types properly.
2. NO `eslint-disable` comments. Fix the real issue.
3. NO secrets/API keys/passwords in code. Only in .env / .env.local.
4. NO `dangerouslySetInnerHTML` without sanitization.
5. NO trust on user input. Validate on client AND server (Zod).
6. NO database errors, stack traces, or file paths shown to user.
7. NO PII (email, phone, password, address) in logs.
8. NO `eval()`, `Function()`, `new Function()`.
9. NO SQL string concatenation. Parameterized queries / ORM only.
10. NO commit of .env, .env.local, node_modules, dist, .next.
11. NO deprecated packages. Run npm audit before adding.
12. NO feature removal without explicit permission.
13. NO API route without error handling.
14. NO button without loading state. Prevent double submit.
15. NO placeholder comments like "// TODO" or "// implement".
16. NO external UI libraries (Bootstrap, MUI, Chakra, shadcn). Native Tailwind CSS + Lucide React.
17. NO paid services. Free tiers only (Neon, Cloudflare, GitHub).
18. NO credit card at any setup step.
19. NO API route without rate limiting.
20. NO sensitive form without ALTCHA / proof-of-work / rate limiting.
21. NO hardcoded color/size/layout that admin cannot change.
22. NO emoji as icon. Use Lucide React only.
23. NO manual destructive SQL for table creation. Use safe incremental DDL / migrations.
24. NO incomplete documentation. Every doc file complete.
25. NO skipping accessibility. Every element keyboard usable (WCAG 2.1 AA).
26. NO skipping SEO. Every page has metadata + OG image.
27. NO skipping PWA. manifest.webmanifest + service worker required.
28. NO skipping caching. Every GET API cached with invalidation.
29. NO Markdown formatting inside code files.
30. NO Mermaid syntax outside .md files.
31. NO synthetic or fake reviews. Strictly adhere to BIS IS 19000:2022 (reviews require verified purchase and support edit/delete).
32. NO hardcoded merchant identities in core components. Support turnkey open-source parameterization via .env.
33. NO YES-MAN BEHAVIOR ("Haan mein haan mat milana"). When changes/suggestions are proposed, perform live real-time research, weigh objective trade-offs without fluff ("no bakwas"), and select the true professional production-grade approach.
34. MANDATORY 7-STEP EXECUTION LIFECYCLE: Plan & Research -> Add/Edit Code -> Local Compile (typecheck + lint) -> Build Verification (npm run build) -> Automated Tests (100% pass on all 38 suites) -> Report Changes & Step-by-Step Test Guide -> Atomic Batched Local Commit (Husky + Commitlint).
35. MANDATORY SKELETON STATES (CLS = 0): Every async page, product grid, cart, and recommendations carousel must render exact-dimension skeletons using Tailwind animate-pulse.
36. ADVANCED PLATFORM TOPOLOGY: Maintain architectural alignment for OpenPanel (cookieless product telemetry), DuckDB (in-process analytical OLAP offloading), and Typesense (sub-50ms instant typo-tolerant search).
37. PROJECT-CENTRIC DEEP THINKING & REAL-LIFE HONEST EXPLANATIONS: Always analyze and design from Aalm Vastralay's real production perspective. Speak the plain technical truth politely with concrete real-life production examples (no fake demos, no vaporware).
38. ZERO-TOUCH AUTO-DATABASE & NON-DESTRUCTIVE MIGRATION: Database must be 100% self-healing. Tables and columns must auto-migrate via `initCleanBaseData` and `db:auto-migrate` with `CREATE/ALTER TABLE IF NOT EXISTS`. Zero manual SQL required by user; zero data loss.
39. IRONCLAD PRIVACY & ZERO-LEAK SECURITY: Strictly zero leak of credentials, API keys, secrets, or customer PII in code, logs, or client payloads. Hardened for OWASP ZAP: `poweredByHeader: false`, anti-CSRF token inputs in forms, restrictive CSP/CORP/COEP headers, and timing-safe crypto comparisons.
40. FAIL-CLOSED ENVIRONMENT SECRETS LAW: All sensitive secrets must be retrieved via `getRequiredEnv(key)` from `src/lib/required-env.ts`. Zero inline fallback strings (`|| 'default'`) in source code. Missing production secret must throw a fatal fail-closed error.
41. CONVENTIONAL COMMITS & AUTOMATED RELEASE DISCIPLINE: All commit messages must strictly pass `commitlint` (`type(scope): subject`). All versioning is automated via Google `release-please` locked in `0.x.x` until explicit manual `1.0.0` milestone. Runs through Quality Gate (Typecheck + Lint + 38 Test Suites + Build).
42. CONTINUOUS SELF-IMPROVEMENT & DOCUMENTATION AUTO-SYNC LAW: Har 4 ya 5 feature changes, security fixes, refactors, ya updates ke baad, AI agent ko bina user ke bole AUTOMATICALLY sabhi `.md` files, `.ai/` knowledge bases (`CONTEXT.md`, `CHANGELOG.md`, `DECISIONS.md`, `TODO.md`, `ARCHITECTURE.md`, `SECURITY.md`), aur `.agent/skills/` (`vibe-security`, `vibe-proof`, `vibe-security-audit`, etc.) ko self-improve aur sync karna hoga. System kabhi outdated docs ke sath nahi chalega.

---

## SECTION 2: CODE QUALITY RULES

- All functions have JSDoc comments.
- All exports have proper types.
- All components are functional (no class components).
- All hooks follow React rules (top level only).
- All async operations wrapped in try/catch.
- All user-facing text in English (with Hindi / regional i18n support).
- All lists have empty states.
- All forms have validation.
- All images have alt text.
- All buttons have loading states.
- All errors have user-friendly messages.
- All magic numbers are named constants.
- All utility functions are pure and testable.
- All types defined in /types folder.
- All API responses follow same shape: `{ success: boolean, data?: T, error?: string }`.

---

## SECTION 3: SECURITY RULES

### Client Side:
- No secrets in browser code. `NEXT_PUBLIC_` only for safe public values.
- CSP headers configured.
- CSRF protection on forms and state-changing POST requests.
- Input validation with Zod.
- Sanitize user input before display.
- Secure cookies (`HttpOnly`, `Secure`, `SameSite=Lax` or `Strict`).
- No sensitive data in localStorage.
- Autocomplete="off" or appropriate semantic autocomplete on sensitive fields.

### Server Side:
- Rate limiting on all endpoints.
- ALTCHA proof-of-work / honeypot on sensitive forms.
- Parameterized queries only (Drizzle ORM).
- Path traversal prevention (`path.normalize`, boundary validation).
- File upload validation (MIME, size, magic bytes).
- Request size limits (1MB default, 10MB upload).
- Request timeout (30s API, 5min upload).
- Generic error messages (no info leakage).
- Audit logging for sensitive actions (`audit_logs`).
- Account lockout after 5 failed logins.

### Authentication:
- Strong password (min 8-12 chars, mixed case, number, symbol).
- Scrypt / Argon2 / Bcrypt cost 12 for passwords.
- Better Auth / Multi-Factor / Email OTP / Magic Link support.
- Session expiry (24h access, 30d refresh).
- Session rotation on sensitive actions.
- Logout from all devices option.
- Email verification required.

### Authorization:
- Role-based access control (customer / seller / admin).
- Resource ownership checks (`storeId = currentSellerStore.id`).
- Row-level security in DB queries.
- Admin actions require re-auth / `requireRole(["admin"])`.
- API endpoint permissions in middleware.

### Data Protection:
- AES-256-GCM for PII (email, phone, address, name).
- Scrypt / bcrypt for passwords.
- HMAC-SHA256 for searchable encrypted fields.
- Encrypted backups.
- No PII in logs/errors/analytics.
- Data retention policy (delete inactive after 2 years).
- GDPR export and delete endpoints.

---

## SECTION 4: DATABASE & ZERO-LOSS MIGRATION RULES

- Primary keys: UUID (`gen_random_uuid()`).
- Timestamps: `TIMESTAMPTZ` with default `now()`.
- Soft delete: `deleted_at TIMESTAMPTZ` or `is_active boolean DEFAULT true`.
- Naming: snake_case for tables and columns in SQL.
- Foreign keys: `{table}_id` format with `ON DELETE CASCADE` or `ON DELETE SET NULL`.
- Every table has `created_at` and `updated_at`.
- Indexes on all foreign keys and search columns.
- Full-text search with indexes.
- Migrations versioned and reversible.
- Auto-migrate on deploy (`src/db/init.ts`).
- Seed data for dev only, not prod.
- **NEVER delete records, use soft delete.**
- **NEVER store plaintext passwords.**
- **NEVER store plaintext PII without masking.**
- **NEVER drop tables or columns in production.**

---

## SECTION 5: API RULES

- RESTful endpoints.
- Proper HTTP status codes:
  200 OK, 201 Created, 400 Bad Request, 401 Unauthorized,
  403 Forbidden, 404 Not Found, 429 Too Many Requests,
  500 Internal Server Error.
- Consistent error response format:
  `{ error: { code: "ERROR_CODE", message: "Generic message", requestId: "req_xxx" } }`
- Request ID for tracing.
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.
- Validate input with Zod on server.
- Return generic errors to client.
- Log detailed errors server-side only.
- Cache GET requests with proper invalidation.
- Use Drizzle ORM, no raw SQL.

---

## SECTION 6: UI/UX RULES

- Mobile-first responsive (320px to 4K).
- Dark theme default with toggle.
- WCAG 2.1 AA accessibility.
- Keyboard navigation support.
- Screen reader friendly (ARIA labels).
- Min tap target 44x44px.
- Focus indicators visible.
- Color contrast 4.5:1 minimum.
- No layout shift on load.
- Skeleton loaders for data.
- Toast notifications for feedback.
- Empty states for all lists.
- Error states for all forms.
- Confirmation dialogs for destructive actions.
- No horizontal scroll on any device.

---

## SECTION 7: PERFORMANCE RULES

- Code splitting per route.
- Lazy load images (`loading="lazy"`).
- Prefetch on hover (`next/link`).
- Cache GET requests (5 min TTL default).
- React Server Components where possible.
- Minimize client-side JavaScript.
- Optimize images with CDN / local resizing transformations.
- Lighthouse score > 90 on all metrics.
- First Contentful Paint < 1.5s.
- Time to Interactive < 3s.
- Cumulative Layout Shift < 0.1.

---

## SECTION 8: TESTING RULES

- All 38 automated enterprise test suites must pass 100% green (`npm test` in `tests/run-all-tests.ts`).
- Unit tests for all utility functions and secret loaders.
- Integration tests for all API routes and checkout / payment flows.
- E2E tests for critical user flows (Guest mode, UPI QR, WhatsApp order confirm).
- Minimum 70% code coverage.
- Strict Quality Gate runs on CI (`release.yml`) before any release.
- Tests must be deterministic and execute in < 2 seconds.
- Tests must not depend on external live networks (use mock or sandbox).
- Mock external APIs in tests (Neon, Backblaze B2, Google Apps Script).
- Test fail-closed error cases, not just happy path.

---

## SECTION 9: GIT RULES

Commit message format:
  `type(scope): subject`

  `type`: feat, fix, docs, style, refactor, test, chore, perf, security, ci
  `scope`: api, ui, db, auth, security, perf, release, env, mailer
  `subject`: imperative mood, no period, max 72 chars

Must pass `commitlint` (`npx commitlint --edit .git/COMMIT_EDITMSG`) and Husky pre-commit hooks (`npm run typecheck && npm run lint`).

Examples:
  `feat(auth): add google 1-click oauth 2.0 flow`
  `fix(ui): correct dropdown text color in dark mode`
  `security(env): enforce fail-closed zero-default secrets`
  `ci(release): setup quality gate and automated release pipeline`

Branch naming:
  `feature/feature-name`
  `fix/bug-name`
  `hotfix/critical-bug-name`
  `chore/task-name`

PR requirements:
  - Descriptive title
  - Link to issue
  - Screenshots for UI changes
  - Test coverage report
  - No merge conflicts
  - CI passing

---

## SECTION 10: DEPLOYMENT RULES

Pre-deploy:
- All tests passing (`npm test`).
- TypeScript compiles (`npm run typecheck`).
- ESLint passes (`npm run lint`).
- Security headers configured.
- Environment variables set.
- Database migrations tested.
- Base schema and clean defaults verified.

Deploy:
- Push to main branch.
- CI runs automatically.
- Migrations run on startup.
- Smoke tests pass.
- Monitoring alerts configured.

Post-deploy:
- Test all user flows.
- Test on mobile devices.
- Test with slow network.
- Verify SEO meta tags.
- Verify OG image.
- Submit sitemap.
- Document any issues.

---

## SECTION 11: WORKFLOW

Every AI session must follow this order:

1. Read `.ai/RULES.md` (this file)
2. Read `.ai/CONTEXT.md` (current state)
3. Read `.ai/PRD.md` (requirements)
4. Read `.ai/ARCHITECTURE.md` (system design)
5. Read `.ai/TODO.md` (what's next)
6. Read `.ai/BUGS.md` (known issues)
7. Then do the task
8. Update `.ai/CHANGELOG.md`
9. Update `.ai/TODO.md`
10. Create snapshot in `.ai/SNAPSHOTS/YYYY-MM-DD.md`
11. If new decision, add to `.ai/DECISIONS.md`

---

## SECTION 12: WHEN IN DOUBT

- Ask for clarification, do not assume.
- Check existing patterns in codebase.
- Refer to `docs/` for architecture decisions.
- Never take shortcuts that compromise security.
- Never add features not in PRD without permission.
- Never remove features without permission.
- Never change database schema without migration.
- Never deploy without tests passing.

---

## SECTION 13: TIERED CI/CD PIPELINE & NIGHTLY SECURITY SCANS LAW

1. **Tier 1 (Fast Gate — Every Push/PR):** `ci.yml` runs Typecheck (`tsc`), ESLint 9, Vitest tests (`npm test`), DB tests (`npm run test:db`), and Next.js build. Target: under 90–120 seconds.
2. **Tier 2 (Release Gate):** `release.yml` maintains a single draft Release PR silently. Merging triggers automated version bump, git tag, and changelog.
3. **Tier 3 (Deep Nightly Scans — Runs Every Night at Off-Peak Hours):**
   - `zap-nightly.yml`: OWASP ZAP DAST crawl runs nightly at 02:00 AM IST (20:30 UTC).
   - `codeql.yml`: CodeQL AST semantic analysis runs nightly at 03:00 AM IST (21:30 UTC) + on PRs.
   - `dependency-security.yml`: NPM security audit runs nightly at 03:30 AM IST (22:00 UTC) + on PRs.

### 💎 3 Golden Laws of GitHub Actions (Resource & Security Contract):
1. **Ubuntu Runner Law (`runs-on: ubuntu-latest`):** Hamesha `ubuntu-latest` use karein. Windows/macOS runners public repos me hote hue bhi bohot slow boot hote hain aur unnecessary runner capacity lete hain.
2. **Zero Misuse & Anti-Abuse Law:** Yeh free CI service strictly legitimate code build, automated tests, aur security scanning ke liye hai. Koi cryptocurrency mining, background spamming, ya resource exhaustion strictly prohibited hai (account ban prevention).
3. **Mandatory NPM Caching Law (`cache: 'npm'`):** `actions/setup-node@v4` ke sath hamesha `cache: 'npm'` hona mandatory hai. Isse dependencies re-download hone ke bajaye cache se restore hoti hain aur build setup 2-3 minute ke bajaye sirf 20-30 second me pura ho jata hai.

---

## SECTION 14: DOCS/RULES.MD USER-COMMAND LOCK LAW

- **Mandatory User Permission:** AI agents must NEVER auto-update, edit, or modify `docs/RULES.md` without the user's explicit, direct instructions.
- **Read-Only Exemption:** Even during 4-5 change auto-sync routines, `docs/RULES.md` remains strictly read-only unless the user specifically directs: *"docs/rules.md mein add karo / update karo"*.
- **Developer Sovereignty:** All master governance laws remain under 100% direct developer authority.
