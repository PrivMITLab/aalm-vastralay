# ==============================================================================
# 👑 AALM VASTRALAY (आलम वस्त्रालय) — MASTER ARCHITECTURAL LAWS & AGENT BLUEPRINT
# Location: docs/RULES.md (Canonical Master Rulebook for All Sessions & AI Agents)
# ==============================================================================

> **CRITICAL DIRECTIVE FOR ALL AI CODING SESSIONS:**
> Whenever instructed to "read rules" or when initializing any session, read this file in full.
> It defines the mandatory anti-yes-man principle, the full repository context map,
> the non-negotiable 6-step execution lifecycle, zero-data-loss contracts, and the architectural
> roadmap for advanced platform modules (OpenPanel, DuckDB, Typesense, Skeletons).

---

## 🧭 SECTION 1: MASTER REPOSITORY DIRECTORY & FILE LINKS

Reading this section gives any agent instant 100% context across the entire repository:

### Core Governance & Documentation Hub:
- 📜 [docs/RULES.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/docs/RULES.md) — This master rulebook (Laws, Protocols, Architecture).
- 📜 [.ai/RULES.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/RULES.md) — 43 Golden Rules, Code Quality, Client/Server Security Standards.
- 📡 [.ai/CONTEXT.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/CONTEXT.md) — Live system state, 38 test suites count, verified verification matrix.
- 🗄️ [.ai/DATABASE.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/DATABASE.md) — Drizzle ORM schemas, Neon PostgreSQL zero-loss migration protocol.
- 📋 [.ai/PRD.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/PRD.md) — Functional specifications, Indian ethnic marketplace business rules.
- 🏗️ [docs/TECH_STACK_AND_ARCHITECTURE.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/docs/TECH_STACK_AND_ARCHITECTURE.md) — Complete multi-tier system topology diagram and tech stack breakdown.
- 🚀 [docs/SETUP.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/docs/SETUP.md) — Local development, Vercel production deployment, and DB setup runbooks.
- 🚀 [docs/RELEASE.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/docs/RELEASE.md) — Canonical Release Automation Runbook (Google release-please, Quality Gate, Vercel hooks).
- 🤝 [CONTRIBUTING.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/CONTRIBUTING.md) — Conventional Commits and development workflow guide.
- ⚖️ [.ai/DECISIONS.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/DECISIONS.md) — Architecture Decision Records (ADR).
- 📜 [.ai/CHANGELOG.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/CHANGELOG.md) — Historical chronological record of releases and fixes.

### Key Codebase Anatomy:
- `src/app/` — Next.js 16 App Router pages, layouts, server actions, and API routes.
- `src/db/` — Drizzle ORM database layer ([`src/db/schema.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/db/schema.ts), [`src/db/index.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/db/index.ts), [`src/db/init.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/db/init.ts)).
- `src/components/` — UI components (Product cards, Header, Footer, Admin, Seller, Modals).
- `src/lib/` — Business logic ([`src/lib/required-env.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/lib/required-env.ts), [`src/lib/ai/client.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/lib/ai/client.ts), [`src/lib/auth.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/lib/auth.ts), [`src/lib/media-resolver.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/lib/media-resolver.ts)).
- `tests/` — Automated enterprise test suites ([`tests/run-all-tests.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/tests/run-all-tests.ts), 38 test suites).
- `.env.development.example` — Template for local development (`http://localhost:3000`).
- `.env.production.example` — Template for live production on Vercel with Neon pooled connection.

---

## 🧠 SECTION 2: THE ANTI-YES-MAN PRINCIPLE (CRITICAL THINKING & LIVE RESEARCH)

> **"Haan mein haan mat milana. No bakwas. Real-time research first."**

1. **Project-Centric Deep Research & Thinking (प्रोजेक्ट-केंद्रित गहन शोध व सोच):**
   - As an autonomous Staff / Principal Software Engineer, your primary allegiance is to the longevity, speed, security, and elegance of **Aalm Vastralay**.
   - Har suggestion, feature request, ya code change par pehle deeply sochein ki yeh is specific Indian ethnic marketplace platform ko kaise behtar, faster, aur zyada robust banayega.
   - Har technical decision se pehle **real-time live research** karein (Next.js 16 App Router contracts, React 19 server/client boundaries, bundle size impact, edge compatibility, latency benchmark, free-tier durability).

2. **Radical Technical Honesty, Polite Tone & Real-Life Explanations (सच्चाई, विनम्रता और वास्तविक उदाहरण):**
   - **No Sugar-Coating, No Blind Agreement:** Agar user ka koi idea production me fail ho sakta hai ya database crash kar sakta hai, toh "Haan" bolne ke bajay politely, respectfully, aur clearly technical sachhai explain karein.
   - **Explain With Real-Life Production Working (Not Fake Demos):** 
     * Kabhi bhi superficial fake demo, mock placeholder, ya superficial claims na dein.
     * Har feature kaise kaam karta hai, use real-life example ke sath samjhayein.
     * Kaam ke piche ka exact data flow, trade-off, aur reason hamesha transparent rakhein.

3. **Grounding in Technical Truth:**
   - Check if an existing native web standard, existing helper, or built-in Next.js/Drizzle utility can solve the problem before pulling in external dependencies.
   - Always verify library compatibility with React 19, Next.js 16, and Edge / Node runtimes.

---

## ⚡ SECTION 3: THE MANDATORY 6-STEP EXECUTION LIFECYCLE

Every code-generating session MUST execute this exact order without skipping steps:

1. **Discovery & Impact Analysis:** Read schema, server actions, client components, and existing tests.
2. **Fail-Closed Env & Zero-Data-Loss Safety:** Never bypass required variables or destructive SQL.
3. **Enterprise Implementation:** Write strict TypeScript, zero `any`, zero dead code.
4. **Verification via Automated Test Suite:** Run `npm run test:all`. Must be 100% green.
5. **Local Git Commit (Husky Gate):** Commit locally with Conventional Commits syntax.
6. **Final Handshake (Zero Remote Push):** Summarize changes and hand over push command to user.

---

## 🏛️ SECTION 4: ADVANCED PLATFORM SPECIFICATIONS

### 1. 📊 OpenPanel Analytics Architecture
- Self-hostable, cookieless, GDPR-compliant event tracking.
- Client tracker (`src/lib/analytics.ts`) batches telemetry to prevent network thread congestion.

### 2. 🦆 DuckDB-Wasm Client-Side Analytical OLAP
- Client-side WASM engine for seller sales forecasting and cohort retention curves.
- Runs analytical SQL queries in web workers without taxing the Neon transactional DB.

### 3. 🔍 Typesense Federated Instant Search
- Microsecond-latency typo-tolerant search across ethnic product catalogs, fabrics, and sellers.

### 4. 💀 Skeletons Loading & Layout Stability (CLS = 0 Contract)
- Cumulative Layout Shift (CLS) must remain `< 0.05` at all times.
- Skeletons must use native Tailwind CSS classes (`animate-pulse bg-[color:var(--surface-2)] rounded-2xl`).

---

## 🛠️ SECTION 5: COMMAND QUICK REFERENCE MATRIX

| Task | Shell Command | Notes |
| :--- | :--- | :--- |
| **Start Local Dev Server** | `npm run dev` | Runs on `http://localhost:3000` |
| **Verify TypeScript Strict** | `npm run typecheck` | Strict mode check, must have 0 errors |
| **Run Linter** | `npm run lint` | ESLint 9 + Next.js rules, 0 errors/warnings |
| **⚠️ Build Verification** | `npm run build` | Next.js production build verification |
| **Run All Test Suites** | `npm test` | Runs all 38 automated enterprise tests |
| **Run Fast Quality Check** | `npm run test:all` | Typecheck + Lint + Test Suite (Runs in ~15s) |
| **Stage Local Changes** | `git add .` | Stages code locally |
| **Commit Local Changes** | `git commit -m "..."` | Runs Husky pre-commit hooks |
| **Verify Commit Message** | `npx commitlint --edit .git/COMMIT_EDITMSG` | Validates Conventional Commits standard |
| **Automated Release** | Triggered via `release.yml` on main push | Google release-please, locked in `0.x.x` |
| **Remote Push (User Only)** | `git push origin main` | Always executed by user, never by agent |

---

## 📜 SECTION 6: CONTINUOUS SELF-IMPROVEMENT & DOCUMENTATION AUTO-SYNC LAW

> **MANDATORY CADENCE LAW (4-5 CHANGES TRIGGER):**
> Har 4 ya 5 feature changes, security fixes, refactors, ya updates ke baad, AI agent ko bina user ke bole **AUTOMATICALLY** sabhi `.md` files, `.ai/` knowledge bases, aur `.agent/skills/` ko self-improve aur sync karna hoga.

---

## 🛡️ SECTION 7: TIERED CI/CD PIPELINE & NIGHTLY SECURITY SCANS LAW (3-TIER PEHREDARI)

> **MANDATORY PERFORMANCE & RESOURCE ATTRIBUTION CONTRACT:**
> Everyday developer pushes must NEVER be choked by 15-minute crawlers or heavy static analyzers.
> We strictly enforce the **Industry-Standard 3-Tier Pipeline**:

1. **⚡ TIER 1: Fast Developer Quality Gate (`ci.yml` — Runs on every `push` and `PR`):**
   - **Target Duration:** Under 90–120 seconds.
   - **Components:** TypeScript Typecheck (`tsc`), ESLint 9 Standards, Vitest Unit Tests (`npm test`), Database Contract Tests (`npm run test:db`), and Next.js Production Build.
   - **Paths Ignore:** Markdown (`**.md`), documentation (`docs/**`), and IDE configs are ignored to eliminate redundant CI runs.

2. **📦 TIER 2: Automated Semantic Release (`release.yml` — Runs on `main` push):**
   - **Target Duration:** ~15–20 seconds.
   - **Behavior:** Updates a single open Release PR silently. Merging triggers automated version bumping, Git tagging, and changelog generation.

3. **🌙 TIER 3: Deep Nightly Security Pentests & Audits (Runs Daily at Night):**
   - **Target Window:** Daily off-peak hours (between 02:00 AM and 04:00 AM IST):
     * **`zap-nightly.yml` (02:00 AM IST / 20:30 UTC):** OWASP ZAP Dynamic Application Security Testing (DAST) crawling localhost.
     * **`codeql.yml` (03:00 AM IST / 21:30 UTC):** GitHub CodeQL deep semantic Abstract Syntax Tree (AST) analysis.
     * **`dependency-security.yml` (03:30 AM IST / 22:00 UTC):** Automated NPM dependency vulnerability audit.
   - **Manual Override:** Every nightly security workflow supports `workflow_dispatch` for on-demand instant auditing from the GitHub Actions tab.

### 💎 3 Golden Laws of GitHub Actions (Resource & Security Contract):
1. **Ubuntu Runner Law (`runs-on: ubuntu-latest`):** Hamesha `ubuntu-latest` use karein. Windows aur macOS runners public repos me available hote hue bhi Ubuntu se bohot slow boot hote hain aur unnecessary runner capacity lete hain.
2. **Zero Misuse & Anti-Abuse Law:** Yeh free CI service strictly legitimate code build, automated tests, aur security scanning ke liye hai. Koi cryptocurrency mining, background spamming, ya resource exhaustion strictly prohibited hai (account ban prevention).
3. **Mandatory NPM Caching Law (`cache: 'npm'`):** `actions/setup-node@v4` ke sath hamesha `cache: 'npm'` hona mandatory hai. Isse dependencies re-download hone ke bajaye cache se restore hoti hain aur build setup 2-3 minute ke bajaye sirf 20-30 second me pura ho jata hai.

---

## 🔒 SECTION 8: DOCS/RULES.MD USER-COMMAND LOCK LAW (उपयोगकर्ता अनुमति अनुबंध)

> **NON-NEGOTIABLE AI RESTRICTION CONTRACT:**
> AI Agent `docs/RULES.md` (ya `docs/rules.md`) ko kabhi bhi automatically, autonomously, ya bina user ki explicit permission ke update / modify / edit **NAHI KAREGA**.
> 
> 1. **Explicit Permission Only:** Sirf aur sirf tabhi `docs/RULES.md` mein koi badlav kiya jayega jab user explicitly bole: *"docs/rules.md mein add karo"* ya *"docs/rules.md update karo"*.
> 2. **Auto-Sync Exemption:** Section 6 (Continuous Auto-Sync) ke dauran bhi `docs/RULES.md` hamesha **STRICTLY READ-ONLY** rahega. Baaki `.ai/` docs update ho sakte hain, lekin master rulebook bina user ke bole chhua nahi jayega.
> 3. **Human-in-the-Loop Sovereignty:** Yeh rule ensure karta hai ki repository ke core governance rules par 100% control sirf developer (user) ka ho.


