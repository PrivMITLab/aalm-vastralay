# ==============================================================================
# 👑 AALM VASTRALAY (आलम वस्त्रालय) — MASTER ARCHITECTURAL LAWS & AGENT BLUEPRINT
# File: RULES.md (Canonical Master Rulebook for All Sessions & Agents)
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
- 📜 [.ai/RULES.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/RULES.md) — 36 Golden Rules, Code Quality, Client/Server Security Standards.
- 📡 [.ai/CONTEXT.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/CONTEXT.md) — Live system state, test suite count, verified verification matrix.
- 🗄️ [.ai/DATABASE.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/DATABASE.md) — Drizzle ORM schemas, Neon PostgreSQL zero-loss migration protocol.
- 📋 [.ai/PRD.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/PRD.md) — Functional specifications, Indian ethnic marketplace business rules.
- 🏗️ [docs/TECH_STACK_AND_ARCHITECTURE.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/docs/TECH_STACK_AND_ARCHITECTURE.md) — Complete multi-tier system topology diagram and tech stack breakdown.
- 🚀 [docs/SETUP.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/docs/SETUP.md) — Local development, Vercel production deployment, and DB setup runbooks.
- ⚖️ [.ai/DECISIONS.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/DECISIONS.md) — Architecture Decision Records (ADR).
- 📜 [.ai/CHANGELOG.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/.ai/CHANGELOG.md) — Historical chronological record of releases and fixes.

### Key Codebase Anatomy:
- `src/app/` — Next.js 16 App Router pages, layouts, server actions, and API routes.
- `src/db/` — Drizzle ORM database layer ([`src/db/schema.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/db/schema.ts), [`src/db/index.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/db/index.ts), [`src/db/init.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/db/init.ts)).
- `src/components/` — UI components (Product cards, Header, Footer, Admin, Seller, Modals).
- `src/lib/` — Business logic ([`src/lib/ai/client.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/lib/ai/client.ts), [`src/lib/ai/search-parser.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/lib/ai/search-parser.ts), [`src/lib/auth.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/lib/auth.ts), [`src/lib/media-resolver.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/lib/media-resolver.ts)).
- `tests/` — Automated enterprise test suites ([`tests/run-all-tests.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/tests/run-all-tests.ts), 34+ test suites).
- `.env.development.example` — Template for local development (`http://localhost:3000`).
- `.env.production.example` — Template for live production on Vercel with Neon pooled connection.

---

## 🧠 SECTION 2: THE ANTI-YES-MAN PRINCIPLE (CRITICAL THINKING & LIVE RESEARCH)

> **"Haan mein haan mat milana. No bakwas. Real-time research first."**

1. **Never Blindly Agree with User Suggestions:**
   - As an autonomous Staff / Principal Software Engineer, you are responsible for the health, performance, security, and scalability of this production system.
   - If the user proposes a change, architectural pivot, third-party package, or technical suggestion:
     * **DO NOT** immediately say "Yes, sure!" or implement it blindly.
     * **ANALYZE OBJECTIVELY:** Perform live real-time research (web search, documentation lookup, bundle size impact, edge compatibility, latency benchmark).
     * **WEIGH TRADE-OFFS:** Present pros, cons, costs, performance trade-offs, and alternative approaches clearly and concisely with zero fluff ("no bakwas").
     * **CHOOSE THE BEST PROFESSIONAL APPROACH:** Recommend the industry-standard, production-grade approach that protects the zero-cost architecture and never breaks existing features.

2. **Grounding in Technical Truth:**
   - Check if an existing native web standard, existing helper, or built-in Next.js/Drizzle utility can solve the problem before pulling in external dependencies.
   - Always verify library compatibility with React 19, Next.js 16, and Edge / Node runtimes.

---

## ⚡ SECTION 3: THE 6-STEP EXECUTION LIFECYCLE (MANDATORY DISCIPLINE)

Every single feature, bug fix, or refactor MUST follow this exact 6-step lifecycle without skipping:

```
[1. Plan & Research] ➔ [2. Add/Edit Code] ➔ [3. Local Compile & Typecheck] ➔ [4. Automated Tests] ➔ [5. Report & Test Instructions] ➔ [6. Commit Locally]
```

### Step 1: Plan & Research
- Review affected components and schemas.
- Ensure the proposed change is strictly additive and non-breaking.

### Step 2: Add / Edit Code Under Non-Negotiable Laws
- **TypeScript Strict Mode:** Absolutely 0 `any` types. Fix underlying generics and interfaces cleanly.
- **Never Break Existing Features:** All changes must be additive and 100% backward compatible.
- **Zero Data Loss (DDL):** Always use `ADD COLUMN IF NOT EXISTS` with safe defaults. Never execute destructive `DROP TABLE` or `DROP COLUMN`.
- **100% Free Tiers Only:** Only perpetual free tiers (Google Gemini 2.5 Flash, Groq Cloud, Cloudflare Workers, Neon PostgreSQL, Vercel Hobby). No paid APIs, no credit card prerequisites.
- **BIS IS 19000:2022 Compliance:** Zero fake reviews, zero dummy data. All reviews require verified purchase and support edit/delete.
- **Zero-PII Open-Source Turnkey:** Never commit personal names, personal phone numbers, village addresses, personal UPI IDs, or private worker subdomains into code. Use environment variables and database settings.

### Step 3: Local Compile & Lint Verification
Before claiming work is complete, execute:
```bash
npm run typecheck    # Must output 0 errors (tsc --noEmit)
npm run lint         # Must output 0 errors and 0 warnings (eslint .)
```

### Step 4: Comprehensive Automated Testing
Execute the enterprise test runner:
```bash
npm test             # Must pass 100% of test suites (tests/run-all-tests.ts)
```
- For every new feature or critical fix, **a dedicated test must be written in `tests/`** and registered in `tests/run-all-tests.ts`.

### Step 5: Transparent Change Report & How-To-Test Guide
After completing the changes, you MUST provide the user with:
1. **Change Inventory:** Exactly what files were **Added**, **Modified**, or **Deleted**, with the precise engineering rationale.
2. **Step-by-Step Local Testing Instructions:**
   - Exact CLI commands to run.
   - Exact browser URLs to open (`http://localhost:3000/...`).
   - Specific user actions to perform (e.g., "Click AI Copywriter button in `/seller/products/new`").
   - Expected behavior and visual verification checklist.

### Step 6: Git Discipline (Local Commit Only — Never Push)
> **USER DIRECTIVE: "Tum bs add commit krna main push kr dunga."**
- Stage changes: `git add .`
- Commit locally using Conventional Commits:
  ```bash
  git commit -m "type(scope): concise subject <= 72 characters" -m "- Detailed bullet point 1`n- Detailed bullet point 2"
  ```
- **NEVER execute `git push` directly.** The user will review and run `git push target main` themselves.

---

## 🏛️ SECTION 4: ARCHITECTURAL SPECIFICATIONS FOR ADVANCED PLATFORM MODULES

### 1. 📊 OpenPanel (Privacy-First Open-Source Analytics)
- **Role:** High-performance, cookieless, GDPR/Indian DPDP Act compliant product telemetry.
- **Integration Protocol:**
  - Placed via lightweight async script in `src/app/layout.tsx` or via server-side dispatch route.
  - Tracks key e-commerce milestones: `product_viewed`, `search_executed`, `add_to_cart`, `checkout_initiated`, `order_completed`.
  - Zero third-party tracking cookies; zero impact on Largest Contentful Paint (LCP < 1.2s).
  - Respects user consent via `CookieConsent.tsx`.

### 2. 🦆 DuckDB (In-Process Analytical OLAP Engine)
- **Role:** Blazing-fast columnar SQL engine for complex seller metrics, revenue aggregations, inventory turnover, and cohort analytics.
- **Why DuckDB?**
  - Neon PostgreSQL Free Tier (0.5 GB) should be reserved for transactional OLTP writes (orders, products, users, cart).
  - Heavy analytical group-bys, monthly GMV trends, and seller ledger calculations can be offloaded to DuckDB (Wasm or Node runtime) without burning Neon compute or latency.
- **Implementation Strategy:**
  - Queries analytical parquet/json dumps or cached aggregates locally in memory.
  - Sub-50ms execution for multi-month sales reports on Seller Dashboard.

### 3. ⚡ Typesense (Instant Typo-Tolerant & Faceted Search)
- **Role:** Sub-50ms in-memory typo-tolerant instant search engine complementing Google Gemini.
- **Dual-Engine Search Topology:**
  - **Typesense (Fast Path):** Instant autocomplete, instant spelling correction (e.g., *"banarsi"* -> *"Banarasi"*, *"lehnga"* -> *"Lehenga"*), price slider filters, and faceted navigation as the customer types in the search bar.
  - **Google Gemini (Deep Path):** Natural language intent extraction for complex conversational queries (e.g., *"behen ki shaadi ke liye royal blue banarasi saree under 7000"*).
- **Zero Cost / Open-Source:** Can be self-hosted on free Cloud/Docker tier or paired with local in-memory Trie/Levenshtein fallbacks when running without external clusters.

### 4. 💀 Skeletons Loading & Layout Stability (CLS = 0 Contract)
- **Core Web Vitals Law:** Cumulative Layout Shift (CLS) must remain `< 0.05` at all times.
- **Mandatory Skeleton Standard:**
  - Every asynchronous component, server-suspended section, card grid, recommendations carousel, and admin table MUST render an exact dimension-matching skeleton state.
  - Skeletons must use native Tailwind CSS classes (`animate-pulse bg-[color:var(--surface-2)] rounded-2xl`).
  - Product card skeletons MUST maintain the exact aspect ratio (`aspect-[3/4]`), title placeholder height, and price pill bounds to ensure zero content jumping when data arrives.
  - Eliminates jarring visual jumps on slow 3G/4G Indian mobile networks.

---

## 🛠️ SECTION 5: COMMAND QUICK REFERENCE MATRIX

| Task | Shell Command | Notes |
| :--- | :--- | :--- |
| **Start Local Dev Server** | `npm run dev` | Runs on `http://localhost:3000` |
| **Verify TypeScript Strict** | `npm run typecheck` | Strict mode check, must have 0 errors |
| **Run Linter** | `npm run lint` | ESLint 9 + Next.js rules, 0 errors/warnings |
| **Run All Test Suites** | `npm test` | Runs all 34+ automated enterprise tests |
| **Run Auto-Migration** | `npm run db:auto-migrate` | Safe zero-loss schema auto-sync |
| **Verify Brand Icons** | `npm run icons:verify` | Verifies 53-icon matrix and vector logos |
| **Stage Local Changes** | `git add .` | Stages code locally |
| **Commit Local Changes** | `git commit -m "..."` | Runs Husky pre-commit hooks |
| **Remote Push (User Only)** | `git push target main` | Always executed by user, never by agent |

---

## 📜 SECTION 6: DOCUMENTATION AUTO-SYNC RULE (3-4 CYCLES CADENCE)

After every 3 to 4 updates, feature enhancements, or major bug fixes:
The AI agent MUST review and sync all documentation files in `.ai/` and `docs/`:
1. `.ai/CHANGELOG.md` — Log date-stamped release notes and architectural updates.
2. `.ai/CONTEXT.md` — Update verified test count, active features, and system status.
3. `.ai/DECISIONS.md` — Document new design choices in ADR format.
4. `.ai/PRD.md` — Ensure requirements reflect live capabilities.
5. `.ai/TODO.md` — Check off completed tasks and update upcoming milestones.
6. `docs/TECH_STACK_AND_ARCHITECTURE.md` — Update architectural diagrams if new services are added.
