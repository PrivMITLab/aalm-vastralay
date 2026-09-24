# ================================================================================
# MASTER VIBE CODING SYSTEM — PRODUCTION GRADE
# Autonomous Skill Loader, Security, UI/UX, SEO, Testing, CI/CD, Migration
# Rakhna kahan hai: .ai/PROMPTS/MASTER_SYSTEM.md
# ================================================================================
# Yeh prompt AI ko do — yeh khud saare skills padhega, samjhega, aur
# tumhare existing project mein implement karega — bina kuch hataye.
# Sab kuch production-grade, secure, aur free-tier compliant.

================================================================================
SECTION 1: ROLE & MISSION
================================================================================

You are an autonomous AI agent with the ability to load, understand,
and apply specialized skills from open-source skill repositories. Your
task is to enhance an existing project (Aalm Vastralay e-commerce
platform) by loading curated skills and implementing their principles,
WITHOUT removing or breaking any existing feature.

Mission:
- Load all skills from repositories listed in Section 2.
- Read all SKILL.md files to understand available skills.
- Analyze the existing project structure.
- Identify gaps in UI/UX, animations, security, SEO, testing, and DevOps.
- Map applicable skills to specific project areas.
- Create an implementation plan (present before execution).
- Execute changes one by one, testing after each.
- Verify all existing features still work.
- Update all documentation and changelog files.
- Ensure zero data loss during any migration.
- Run production-level security audit (penetration testing).
- Ensure Lighthouse score > 90 on all metrics.
- Ensure all free-tier limits are respected.

================================================================================
SECTION 2: SKILL REPOSITORIES TO LOAD FROM
================================================================================

Load skills from these repositories. Each repository contains SKILL.md
files that you must read and apply. Clone all of them into
.agent/skills/ directory.

PRIMARY SKILL LIBRARIES:

1. Antigravity Awesome Skills
   - GitHub: https://github.com/sickn33/antigravity-awesome-skills
   - Contains: 1,935+ skills across development, testing, security,
     infrastructure, product, marketing.
   - Install: npx antigravity-awesome-skills --path .agent/skills
   - Key skills: docker-expert, nodejs-best-practices, typescript-expert,
     clean-code, react-patterns, tailwind-mastery, frontend-design.

2. UI-UX Pro Max
   - GitHub: https://github.com/nextlevelbuilder/ui-ux-pro-max
   - Contains: Design intelligence for sharper web and mobile UI,
     component recommendations, spacing systems, typography.
   - Install: git clone https://github.com/nextlevelbuilder/ui-ux-pro-max.git .agent/skills/ui-ux-pro-max

3. Frontend Design Skill
   - GitHub: https://github.com/nextlevelbuilder/frontend-design
   - Contains: Production-grade interfaces that avoid generic AI aesthetics.
   - Install: git clone https://github.com/nextlevelbuilder/frontend-design.git .agent/skills/frontend-design

4. Motion Design Skill (LottieFiles)
   - GitHub: https://github.com/LottieFiles/motion-design-skill
   - Contains: Universal motion design principles — timing, easing,
     choreography, Disney animation principles adapted for UI.
   - Install: npx skills add LottieFiles/motion-design-skill

5. Vibe Security Skill
   - GitHub: https://github.com/TavinDoABC/skills-vibe-coding-security
   - Contains: Security playbook for building, auditing, and repairing
     AI-generated systems.
   - Install: git clone https://github.com/TavinDoABC/skills-vibe-coding-security.git .agent/skills/vibe-security

6. Vibe Security Audit Skill
   - GitHub: https://github.com/LadyKerr/Vibe-Security-Skill
   - Contains: 30-point security audit for vibe-coded projects.
   - Install: git clone https://github.com/LadyKerr/Vibe-Security-Skill.git .agent/skills/vibe-security-audit

7. Secure Vibe Starter
   - GitHub: https://github.com/spbavarva/secure-vibe-starter
   - Contains: CLAUDE.md rules, THREAT_MODEL.md, security-reviewer.md,
     settings.json hooks, security.yaml CI workflow.
   - Install: git clone https://github.com/spbavarva/secure-vibe-starter.git .agent/skills/secure-vibe

8. Awesome Agent Skills (Kodus)
   - GitHub: https://github.com/kodustech/awesome-agent-skills
   - Contains: Curated list with sections for Frontend, Backend, DevOps,
     Security, Testing, Observability, Performance, Mobile, Blockchain,
     Infrastructure, Data Science, AI/ML.
   - Install: git clone https://github.com/kodustech/awesome-agent-skills.git .agent/skills/awesome-skills

9. Awesome Agent Skills (Frontend)
   - GitHub: https://github.com/danielteles/awesome-agent-skills
   - Contains: Composable, model-agnostic AI agent skills for frontend
     engineering — TypeScript, React, Angular, architecture,
     accessibility, and test quality.
   - Install: git clone https://github.com/danielteles/awesome-agent-skills.git .agent/skills/awesome-frontend

10. Agentic SEO Skill
    - GitHub: https://github.com/Bhanunamikaze/Agentic-SEO-Skill
    - Contains: 16 specialized sub-skills, 10 specialist agents, 89 scripts.
    - Install: git clone https://github.com/Bhanunamikaze/Agentic-SEO-Skill.git .agent/skills/agentic-seo

11. Marketing Skills
    - GitHub: https://github.com/coreyhaines31/marketingskills
    - Contains: 160+ open-source skills for SEO, content, 40+ page types,
      paid ads, channels.
    - Install: npx skills add coreyhaines31/marketingskills

12. Web Quality Skills (Addy Osmani)
    - GitHub: https://github.com/addyosmani/web-quality-skills
    - Contains: Agent Skills for optimizing web quality based on Lighthouse
      and Core Web Vitals.
    - Install: npx skills add addyosmani/web-quality-skills

13. RankSpot Awesome SEO
    - GitHub: https://github.com/RankSpotAI/awesome-seo-agent-skills
    - Contains: Curated list of Agent Skills for SEO — technical audits,
      keyword research, content briefs, schema, GEO, AI visibility.
    - Install: git clone https://github.com/RankSpotAI/awesome-seo-agent-skills.git .agent/skills/seo-awesome

14. Performance Audit Skill
    - GitHub: https://github.com/brunnocarpena/performance-audit-skill
    - Contains: Page performance auditing (PageSpeed Insights /
      Lighthouse / Core Web Vitals).
    - Install: git clone https://github.com/brunnocarpena/performance-audit-skill.git .agent/skills/performance-audit

15. E-commerce Skills
    - GitHub: https://github.com/nexscope-ai/eCommerce-Skills
    - Contains: 157 free AI agent skills for e-commerce.
    - Install: npx skills add nexscope-ai/eCommerce-Skills --skill product-description-generator

16. SEO Umbrella Skill
    - GitHub: https://github.com/magnus919/agent-skills
    - Contains: Umbrella skill for technical SEO, on-page optimization,
      AEO, GEO.
    - Install: git clone https://github.com/magnus919/agent-skills.git .agent/skills/seo-umbrella

17. Claude Skills (SEO Specialist)
    - GitHub: https://github.com/borghei/Claude-Skills
    - Contains: Technical SEO, content optimization, link building,
      keyword research, search analytics.
    - Install: git clone https://github.com/borghei/Claude-Skills.git .agent/skills/claude-skills

18. Recon Skills (Pentest)
    - GitHub: https://github.com/affilares/recon-skills
    - Contains: 156 offensive security skills for recon and pentest.
    - Install: git clone https://github.com/affilares/recon-skills.git .agent/skills/recon-skills

19. Skills4RedTeam
    - GitHub: https://github.com/din4e/Skills4RedTeam
    - Contains: Red team skills — reconnaissance, exploitation, lateral
      movement, post-exploitation, CTF, OSINT.
    - Install: git clone https://github.com/din4e/Skills4RedTeam.git .agent/skills/redteam

20. Anthropic Cybersecurity Skills
    - GitHub: https://github.com/cindyflower/anthropic-cybersecurity-skills
    - Contains: 55+ skills across AI security, supply chain security,
      hardware/firmware security.
    - Install: git clone https://github.com/cindyflower/anthropic-cybersecurity-skills.git .agent/skills/cybersecurity

21. UI/UX Design Pro Skill
    - GitHub: https://github.com/saifyxpro/ui-ux-design-pro-skill
    - Contains: 107 styles, 127 palettes, 107 fonts, 150+ reasoning rules,
      18 platform templates.
    - Install: git clone https://github.com/saifyxpro/ui-ux-design-pro-skill.git .agent/skills/ui-ux-design-pro

22. Vibe Proof Skills
    - GitHub: https://github.com/HermeticOrmus/vibe-proof-skills
    - Contains: Parallel security audit across frontend, backend, and
      config, then fixes by severity.
    - Install: git clone https://github.com/HermeticOrmus/vibe-proof-skills.git .agent/skills/vibe-proof

================================================================================
SECTION 3: FILE STRUCTURE — COPY THIS EXACTLY
================================================================================

tumhara-project/
│
├── .ai/                                    (AI context folder)
│   ├── RULES.md                            (this file)
│   ├── CONTEXT.md                          (project state)
│   ├── PRD.md                              (requirements)
│   ├── ARCHITECTURE.md                     (system design)
│   ├── DATABASE.md                         (schema + migrations)
│   ├── API.md                              (endpoints doc)
│   ├── SECURITY.md                         (security checklist)
│   ├── DESIGN_SYSTEM.md                    (UI tokens)
│   ├── DECISIONS.md                        (architecture decisions)
│   ├── CHANGELOG.md                        (what changed)
│   ├── TODO.md                             (pending tasks)
│   ├── BUGS.md                             (known bugs)
│   ├── PROMPTS/                            (reusable prompts)
│   │   ├── ADD_FEATURE.md
│   │   ├── FIX_BUG.md
│   │   ├── REFACTOR.md
│   │   ├── REVIEW.md
│   │   ├── SEO_AUTONOMOUS.md
│   │   ├── ICON_GENERATION.md
│   │   ├── ENTERPRISE_QUALITY.md
│   │   └── MASTER_SYSTEM.md
│   └── SNAPSHOTS/                          (daily context)
│       └── YYYY-MM-DD.md
│
├── .cursorrules                            (for Cursor AI)
├── .windsurfrules                          (for Windsurf AI)
├── CLAUDE.md                               (for Claude Code)
├── GEMINI.md                               (for Gemini & Antigravity)
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── security.yml
│   │   ├── codeql.yml
│   │   ├── semgrep.yml
│   │   ├── dependency-security.yml
│   │   ├── code-quality.yml
│   │   ├── test.yml
│   │   ├── build.yml
│   │   ├── lighthouse.yml
│   │   ├── secrets-scan.yml
│   │   ├── container-security.yml
│   │   ├── license-check.yml
│   │   └── pr-gate.yml
│   ├── dependabot.yml
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       ├── feature_request.md
│       └── security_report.md
│
├── docs/                                   (public docs)
│   ├── README.md
│   ├── SETUP.md
│   ├── DEPLOYMENT.md
│   ├── RUNBOOK.md
│   ├── CONTRIBUTING.md
│   ├── SECURITY.md
│   ├── TERMS.md
│   ├── PRIVACY.md
│   └── ICONS.md
│
├── src/
│   ├── app/                                (Next.js App Router)
│   │   ├── (auth)/
│   │   ├── (shop)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   ├── legal/
│   │   ├── icon.tsx
│   │   ├── apple-icon.tsx
│   │   ├── opengraph-image.tsx
│   │   ├── twitter-image.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── features/
│   ├── lib/
│   │   ├── db/
│   │   ├── auth/
│   │   ├── security/
│   │   ├── validation/
│   │   ├── api/
│   │   ├── utils/
│   │   └── constants/
│   ├── hooks/
│   ├── types/
│   ├── styles/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── public/                                 (static assets)
│   ├── logo.svg
│   ├── logo-source.svg
│   ├── og-image.png
│   ├── manifest.json
│   ├── browserconfig.xml
│   ├── safari-pinned-tab.svg
│   ├── sw.js
│   └── icons/                              (all generated icons)
│
├── scripts/
│   ├── generate-all-icons.ts
│   └── neon-reset.sql
│
├── migrations/
├── .env.example
├── .env.local                              (GITIGNORED)
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── .editorconfig
├── .nvmrc
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── drizzle.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── README.md

================================================================================
SECTION 4: MASTER RULES FILE (.ai/RULES.md)
================================================================================

# VIBE CODING — MASTER RULES FILE

## SECTION 1: GOLDEN RULES (NEVER BREAK)

1. TypeScript strict mode. NO `any` type. Ever.
2. NO `eslint-disable` comments. Fix the real issue.
3. NO secrets/API keys/passwords in code. Only in .env.local.
4. NO `dangerouslySetInnerHTML` without sanitization.
5. NO trust on user input. Validate on client AND server.
6. NO database errors, stack traces, or file paths shown to user.
7. NO PII (email, phone, password, address) in logs.
8. NO `eval()`, `Function()`, `new Function()`.
9. NO SQL string concatenation. Parameterized queries only.
10. NO commit of .env.local, node_modules, dist.
11. NO deprecated packages. Run npm audit before adding.
12. NO feature removal without explicit permission.
13. NO API route without error handling.
14. NO button without loading state. Prevent double submit.
15. NO placeholder comments like "// TODO" or "// implement".
16. NO external UI libraries (Bootstrap, MUI, Chakra, shadcn).
17. NO paid services. Free tiers only.
18. NO credit card at any setup step.
19. NO API route without rate limiting.
20. NO sensitive form without ALTCHA proof-of-work.
21. NO hardcoded color/size/layout that admin cannot change.
22. NO emoji as icon. Use Lucide React only.
23. NO manual SQL for table creation. Use Drizzle migrations.
24. NO incomplete documentation. Every doc file complete.
25. NO skipping accessibility. Every element keyboard usable.
26. NO skipping SEO. Every page has metadata + OG image.
27. NO skipping PWA. manifest.json + service worker required.
28. NO skipping caching. Every GET API cached with invalidation.
29. NO Markdown formatting inside code files.
30. NO Mermaid syntax outside .md files.

## SECTION 2: CODE QUALITY RULES

- All functions have JSDoc comments.
- All exports have proper types.
- All components are functional (no class components).
- All hooks follow React rules (top level only).
- All async operations wrapped in try/catch.
- All user-facing text in English (with i18n support).
- All lists have empty states.
- All forms have validation.
- All images have alt text.
- All buttons have loading states.
- All errors have user-friendly messages.
- All magic numbers are named constants.
- All utility functions are pure and testable.
- All types defined in /types folder.
- All API responses follow same shape.

## SECTION 3: SECURITY RULES

Client Side:
- No secrets in browser code.
- CSP headers configured.
- CSRF tokens on forms.
- Input validation with Zod.
- Sanitize user input before display.
- Secure cookies (HttpOnly, Secure, SameSite=Strict).
- No sensitive data in localStorage.
- Autocomplete="off" on sensitive fields.

Server Side:
- Rate limiting on all endpoints.
- ALTCHA proof-of-work on sensitive forms.
- Parameterized queries only.
- Path traversal prevention.
- File upload validation (MIME, size, magic bytes).
- Request size limits (1MB default, 10MB upload).
- Request timeout (30s API, 5min upload).
- Generic error messages (no info leakage).
- Audit logging for sensitive actions.
- Account lockout after 5 failed logins.

Authentication:
- Strong password (min 12 chars, mixed case, number, symbol).
- bcrypt cost 12 for passwords.
- MFA support.
- Session expiry (24h access, 30d refresh).
- Session rotation on sensitive actions.
- Logout from all devices option.
- Email verification required.

Authorization:
- Role-based access control (customer/seller/admin).
- Resource ownership checks.
- Row-level security in DB queries.
- Admin actions require re-auth.
- API endpoint permissions in middleware.

Data Protection:
- AES-256-GCM for PII (email, phone, address, name).
- bcrypt for passwords.
- HMAC-SHA256 for searchable encrypted fields.
- Encrypted backups.
- No PII in logs/errors/analytics.
- Data retention policy (delete inactive after 2 years).
- GDPR export and delete endpoints.

## SECTION 4: DATABASE RULES

- Primary keys: UUID (gen_random_uuid()).
- Timestamps: TIMESTAMPTZ with default now().
- Soft delete: deleted_at TIMESTAMPTZ.
- Naming: snake_case for tables and columns.
- Foreign keys: {table}_id format.
- Every table has created_at and updated_at.
- Indexes on all foreign keys and search columns.
- Full-text search with GIN index.
- Migrations versioned and reversible.
- Auto-migrate on deploy.
- Seed data for dev only, not prod.
- Never delete records, use soft delete.
- Never store plaintext passwords.
- Never store plaintext PII.

## SECTION 5: API RULES

- RESTful endpoints.
- Proper HTTP status codes:
  200 OK, 201 Created, 400 Bad Request, 401 Unauthorized,
  403 Forbidden, 404 Not Found, 429 Too Many Requests,
  500 Internal Server Error.
- Consistent error response format:
  { error: { code: "ERROR_CODE", message: "Generic message", requestId: "req_xxx" } }
- Request ID for tracing.
- Rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After.
- Validate input with Zod on server.
- Return generic errors to client.
- Log detailed errors server-side only.
- Cache GET requests with proper invalidation.
- Use Drizzle ORM, no raw SQL.

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

## SECTION 7: PERFORMANCE RULES

- Code splitting per route.
- Lazy load images (loading="lazy").
- Prefetch on hover (next/link).
- Cache GET requests (5 min TTL default).
- React Server Components where possible.
- Minimize client-side JavaScript.
- Optimize images with ImageKit transformations.
- Lighthouse score > 90 on all metrics.
- First Contentful Paint < 1.5s.
- Time to Interactive < 3s.
- Cumulative Layout Shift < 0.1.

## SECTION 8: TESTING RULES

- Unit tests for all utility functions.
- Integration tests for all API routes.
- E2E tests for critical user flows.
- Minimum 70% code coverage.
- Tests run on CI before merge.
- Tests must be deterministic.
- Tests must not depend on external services.
- Mock external APIs in tests.
- Test error cases, not just happy path.

## SECTION 9: GIT RULES

Commit message format:
  type(scope): subject

  type: feat, fix, docs, style, refactor, test, chore, perf, security
  scope: api, ui, db, auth, security, perf
  subject: imperative mood, no period, max 72 chars

Examples:
  feat(auth): add password reset flow
  fix(ui): correct dropdown text color in dark mode
  docs(api): update products endpoint examples
  security(auth): add login rate limiting

Branch naming:
  feature/feature-name
  fix/bug-name
  hotfix/critical-bug-name
  chore/task-name

PR requirements:
  - Descriptive title
  - Link to issue
  - Screenshots for UI changes
  - Test coverage report
  - No merge conflicts
  - CI passing

## SECTION 10: DEPLOYMENT RULES

Pre-deploy:
- All tests passing.
- TypeScript compiles.
- ESLint passes.
- Lighthouse > 90.
- Security headers configured.
- Environment variables set.
- Database migrations tested.
- Seed data loaded.

Deploy:
- Push to main branch.
- CI runs automatically.
- Migrations run on build.
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

## SECTION 11: WORKFLOW (HAR AI SESSION MEIN)

1. Read .ai/RULES.md (this file)
2. Read .ai/CONTEXT.md (current state)
3. Read .ai/PRD.md (requirements)
4. Read .ai/ARCHITECTURE.md (system design)
5. Read .ai/TODO.md (what's next)
6. Read .ai/BUGS.md (known issues)
7. Then do the task
8. Update .ai/CHANGELOG.md
9. Update .ai/TODO.md
10. Create snapshot in .ai/SNAPSHOTS/YYYY-MM-DD.md
11. If new decision, add to .ai/DECISIONS.md

## SECTION 12: JAB DOUBT HO

- Clarification maango, assume mat karo.
- Codebase mein existing patterns check karo.
- Architecture decisions ke liye docs/ dekho.
- Kabhi bhi shortcut mat lo jo security compromise kare.
- PRD mein nahi hai toh feature add mat karo bina permission.
- Bina permission feature remove mat karo.
- Bina migration database schema change mat karo.
- Bina tests passing deploy mat karo.

================================================================================
SECTION 5: AUTONOMOUS EXECUTION PROTOCOL
================================================================================

When given this prompt, execute the following steps autonomously:

STEP 1: DISCOVERY
- Clone all skill repositories listed in Section 2.
- Read all SKILL.md files to understand available skills.
- List all skills that can be applied to the project.
- Categorize skills by domain (UI, animation, security, pentest,
  SEO, backend, database, testing, devops).

STEP 2: ANALYSIS
- Analyze the existing project structure.
- Identify gaps in UI/UX, animations, security, SEO, and backend.
- Map applicable skills to specific project areas.
- Prioritize changes (high-impact first).

STEP 3: PLANNING
- For each identified change, create a plan:
  - What skill to apply
  - What files to modify
  - What new files to create
  - What tests to write
  - What documentation to update
- Present the plan before execution.

STEP 4: EXECUTION
- Execute changes one by one.
- After each change, run tests.
- If tests fail, debug and fix.
- Never move to next change until current one passes.

STEP 5: VERIFICATION
- Run full test suite.
- Run typecheck.
- Run build.
- Run lint.
- Run Lighthouse CI.
- Verify all existing features still work.
- Verify new features work.

STEP 6: DOCUMENTATION
- Update .ai/CHANGELOG.md with all changes.
- Update .ai/TODO.md marking completed tasks.
- Create .ai/SNAPSHOTS/YYYY-MM-DD.md with summary.
- Update .ai/DECISIONS.md with new ADRs.
- Update .ai/DATABASE.md if schema changed.
- Update .ai/API.md if endpoints changed.
- Update .ai/SECURITY.md if security improved.

STEP 7: MIGRATION (SAFE, NO DATA LOSS)
- Before any database change, take a backup.
- Use ADD COLUMN IF NOT EXISTS with DEFAULT values.
- NEVER drop tables, columns, or rename existing columns.
- Run migrations on a staging database first.
- Verify existing data remains intact.
- If migration fails, run down migration.
- Document migration in .ai/DATABASE.md.

STEP 8: PENETRATION TESTING
- Run reconnaissance on API endpoints.
- Test for authentication bypass.
- Test for authorization bypass.
- Test for injection vulnerabilities (SQL, NoSQL, command).
- Test for XSS vulnerabilities.
- Test for CSRF vulnerabilities.
- Test for rate limit bypass.
- Test for LLM-specific vulnerabilities.
- Run supply chain security checks (SBOM, dependency confusion).
- Document findings in .ai/BUGS.md with severity.

STEP 9: ICON GENERATION
- Create source logo SVG.
- Generate all icon types (favicons, PWA, Apple, Windows, OG images).
- Update manifest.json with all icons.
- Add meta tags in layout.tsx.
- Verify icons load on all platforms.

STEP 10: SEO OPTIMIZATION
- Generate robots.txt and sitemap.xml.
- Add canonical tags to all pages.
- Add structured data (Product, Review, Breadcrumb, FAQ, Organization).
- Optimize title tags and meta descriptions.
- Fix Core Web Vitals (LCP, INP, CLS).
- Add Open Graph and Twitter Card tags.
- Add image alt text.
- Add internal linking.
- Add E-E-A-T signals.
- Add GEO/AEO optimization (AI crawler access, llms.txt).

STEP 11: CI/CD SETUP
- Add GitHub Actions workflows (CodeQL, Semgrep, Lighthouse,
  dependency security, secrets scanning, license compliance).
- Add Husky pre-commit, commit-msg, pre-push hooks.
- Add Dependabot configuration.
- Add branch protection rules (manual step).

STEP 12: FINAL VERIFICATION
- Run full test suite.
- Run typecheck.
- Run build.
- Run lint.
- Run Lighthouse CI.
- Verify all existing features still work.
- Verify new features work.
- Verify free-tier limits not exceeded.
- Verify documentation updated.

================================================================================
SECTION 6: SPECIFIC SKILLS TO APPLY
================================================================================

UI/UX ENHANCEMENTS:
- Apply Bento Grid 2.0 for product listing.
- Apply APCA contrast for text readability.
- Apply GenUI for dynamic components.
- Apply 107 styles, 127 palettes, 107 fonts from UI/UX Design Pro.
- Apply responsive design (320px to 4K).
- Apply dark mode with toggle.
- Apply WCAG 2.1 AA accessibility.

ANIMATION ENHANCEMENTS:
- Apply motion design principles (timing, easing, choreography).
- Add entrance/exit animations for product cards.
- Add state feedback for buttons (loading, success, error).
- Add scroll-triggered animations for product sections.
- Add micro-interactions for add-to-cart, wishlist.
- Ensure prefers-reduced-motion support.

SECURITY ENHANCEMENTS:
- Apply input validation with Zod on all forms.
- Apply rate limiting on all API routes.
- Apply ALTCHA proof-of-work on sensitive forms.
- Apply RLS (Row Level Security) in database.
- Apply encryption for PII.
- Apply CSRF tokens on state-changing requests.
- Apply generic error messages (no info leakage).
- Apply audit logging for sensitive actions.
- Run 30-point security audit from Vibe Security Skill.
- Run parallel frontend/backend/config audit from Vibe Proof.

PENETRATION TESTING ENHANCEMENTS:
- Run reconnaissance on API endpoints.
- Test for authentication bypass.
- Test for authorization bypass.
- Test for injection vulnerabilities (SQL, NoSQL, command).
- Test for XSS vulnerabilities.
- Test for CSRF vulnerabilities.
- Test for rate limit bypass.
- Test for LLM-specific vulnerabilities.
- Run supply chain security checks (SBOM, dependency confusion).
- Document findings in .ai/BUGS.md with severity.

SEO ENHANCEMENTS:
- Generate robots.txt with proper rules.
- Generate XML sitemap with all pages.
- Add canonical tags to all pages.
- Add structured data (Product, Review, Breadcrumb, FAQ, Organization).
- Optimize title tags (50-60 chars).
- Optimize meta descriptions (150-160 chars).
- Optimize heading hierarchy (single H1, logical H2/H3).
- Add image alt text.
- Add Open Graph tags.
- Add Twitter Card tags.
- Optimize Core Web Vitals (LCP, INP, CLS).
- Add E-E-A-T signals.
- Add GEO/AEO optimization (AI crawler access, llms.txt).
- Add image SEO (lazy loading, WebP/AVIF, dimensions).

BACKEND ENHANCEMENTS:
- Apply Server Components where possible.
- Apply streaming for large data sets.
- Apply parallel routes for dashboard.
- Apply proper caching with invalidation.
- Apply connection pooling for database.
- Apply Edge runtime where possible.

TESTING ENHANCEMENTS:
- Add unit tests for all utility functions.
- Add integration tests for all API routes.
- Add E2E tests for critical flows.
- Add accessibility tests.
- Add performance tests.
- Add security tests.

DEVOPS ENHANCEMENTS:
- Add GitHub Actions workflows (CodeQL, Semgrep, Lighthouse,
  dependency security, secrets scanning, license compliance).
- Add Husky pre-commit, commit-msg, pre-push hooks.
- Add Dependabot configuration.
- Add branch protection rules.

ICON GENERATION:
- Generate all icon types:
  - Favicons (16, 32, 96, ICO, SVG)
  - Apple (76, 152, 167, 180)
  - Android/PWA (72, 96, 128, 144, 152, 192, 384, 512)
  - Maskable (192, 512)
  - Windows Tiles (70, 144, 150, 310, 310x150)
  - Social/OG (1200x630, 1200x600)
  - Next.js dynamic (icon.tsx, apple-icon.tsx, opengraph-image.tsx, twitter-image.tsx)

================================================================================
SECTION 7: VERIFICATION CHECKLIST
================================================================================

After implementation, verify:

[ ] All existing tests pass
[ ] All new tests pass
[ ] TypeScript compiles with 0 errors
[ ] Build succeeds with 0 errors
[ ] Lint passes with 0 errors
[ ] Lighthouse score > 90 on all metrics
[ ] All 5 image sources still work
[ ] Auth flow works
[ ] Cart flow works
[ ] Checkout flow works
[ ] Admin panel works
[ ] Mobile responsive (320px to 4K)
[ ] Dark mode works
[ ] Animations are smooth (60fps)
[ ] No console errors
[ ] No broken links
[ ] Security headers present
[ ] Rate limiting works
[ ] ALTCHA works
[ ] robots.txt generated
[ ] sitemap.xml generated
[ ] Canonical tags present
[ ] Schema markup valid
[ ] Core Web Vitals passing
[ ] Open Graph tags present
[ ] Twitter Card tags present
[ ] Image alt text present
[ ] Internal linking present
[ ] Penetration test findings documented
[ ] Database migrations applied
[ ] .ai/ files updated
[ ] Git commit with proper message
[ ] Push to branch

================================================================================
SECTION 8: DOCUMENTATION UPDATE PROTOCOL
================================================================================

After every 3-4 feature updates, automatically update all .md files:

1. .ai/CHANGELOG.md — Add entry for each change.
2. .ai/TODO.md — Mark completed tasks.
3. .ai/DECISIONS.md — Add new ADRs.
4. .ai/DATABASE.md — Update if schema changed.
5. .ai/API.md — Update if endpoints changed.
6. .ai/SECURITY.md — Update if security improved.
7. .ai/SNAPSHOTS/YYYY-MM-DD.md — Create daily snapshot.
8. docs/README.md — Update feature list.
9. docs/SETUP.md — Update setup steps.
10. docs/DEPLOYMENT.md — Update deployment guide.
11. docs/RUNBOOK.md — Update troubleshooting.
12. docs/ICONS.md — Document icon system.
13. docs/QUALITY.md — Document quality system.

================================================================================
SECTION 9: ROLLBACK & SAFETY
================================================================================

If anything fails:
- Revert git commit
- Run down migration
- Restore from backup
- Document in .ai/BUGS.md
- Notify user

Emergency commands:
git checkout -- <file> # Revert single file
git revert <commit> # Revert commit
npm run db:rollback # Revert migration
