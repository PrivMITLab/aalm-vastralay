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

1. **Project-Centric Deep Research & Thinking (प्रोजेक्ट-केंद्रित गहन शोध व सोच):**
   - As an autonomous Staff / Principal Software Engineer, your primary allegiance is to the longevity, speed, security, and elegance of **Aalm Vastralay**.
   - Har suggestion, feature request, ya code change par pehle deeply sochein ki yeh is specific Indian ethnic marketplace platform ko kaise behtar, faster, aur zyada robust banayega.
   - Har technical decision se pehle **real-time live research** karein (Next.js 16 App Router contracts, React 19 server/client boundaries, bundle size impact, edge compatibility, latency benchmark, free-tier durability).

2. **Radical Technical Honesty, Polite Tone & Real-Life Explanations (सच्चाई, विनम्रता और वास्तविक उदाहरण):**
   - **No Sugar-Coating, No Blind Agreement:** Agar user ka koi idea production me fail ho sakta hai ya database crash kar sakta hai, toh "Haan" bolne ke bajay politely, respectfully, aur clearly technical sachhai explain karein.
   - **Explain With Real-Life Production Working (Not Fake Demos):** 
     * Kabhi bhi superficial fake demo, mock placeholder, ya superficial claims na dein.
     * Har feature kaise kaam karta hai, use real-life example ke sath samjhayein (jaise: *"Google OAuth me Google user ko authenticate karke redirect URL par temporary authorization code bhejta hai, server us code ko Google token endpoint par exchange karke profile lata hai aur signed cookie issue karta hai"*).
     * Kaam ke piche ka exact data flow, trade-off, aur reason hamesha transparent rakhein.

3. **Grounding in Technical Truth:**
   - Check if an existing native web standard, existing helper, or built-in Next.js/Drizzle utility can solve the problem before pulling in external dependencies.
   - Always verify library compatibility with React 19, Next.js 16, and Edge / Node runtimes.

---

## ⚡ SECTION 3: THE 7-STEP EXECUTION LIFECYCLE (MANDATORY DISCIPLINE)

Every single feature, bug fix, or refactor MUST follow this exact 7-step lifecycle without skipping:

```
[1. Plan & Research] ➔ [2. Add/Edit Code] ➔ [3. Local Compile & Typecheck] ➔ [4. Build Verification] ➔ [5. Automated Tests] ➔ [6. Report & Test Instructions] ➔ [7. Commit Locally]
```

### Step 1: Plan & Research
- Review affected components and schemas.
- Ensure the proposed change is strictly additive and non-breaking.

### Step 2: Add / Edit Code Under Non-Negotiable Laws

- **TypeScript Strict Mode:** Absolutely 0 `any` types. Fix underlying generics and interfaces cleanly.
- **Never Break Existing Features:** All changes must be additive and 100% backward compatible.
- **Zero-Touch Database Auto-Creation & Seamless Migration (ऑटो-डेटाबेस व ऑटो-माइग्रेशन गारंटी):**
  * Database ko humesha **self-healing aur zero-touch** rehna chahiye. User ko kabhi manual SQL script run karne ki zaroorat nahi padni chahiye.
  * Har nayi table ya column `TABLE_DDL_STATEMENTS` aur `autoEnsureTables` ([`src/db/init.ts`](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/src/db/init.ts)) me `CREATE TABLE IF NOT EXISTS` aur `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` ke sath register honi chahiye.
  * Server boot par ya `npm run db:auto-migrate` par sabhi tables, columns, indexes, aur relations automatically safely synchronize ho jayein.
  * **Zero Data Loss (DDL):** Never execute destructive `DROP TABLE` or `DROP COLUMN`. Always use non-destructive schema evolutions with sensible defaults.
- **Ironclad Privacy & Zero-Leak Security Architecture (पूर्ण गोपनीयता और शून्य-लीक सुरक्षा):**
  * **Zero Secret / API Key Leaks:** Kabhi bhi API keys, webhook secrets, database connection strings, ya authentication secrets ko client-side bundles, console logs, ya error responses me expose na karein. Production me missing secret hone par fail-closed sentinel implement karein.
  * **Zero PII Exposure:** Customer ke personal details (phone numbers, full addresses, UPI IDs) ko public APIs aur client payloads me masked format me bhejien (`******1234`).
  * **OWASP ZAP & DAST Defense:**
    - Server technology disclosure ko rokne ke liye `poweredByHeader: false` enforce karein.
    - Forms me Anti-CSRF tokens aur Same-Origin verification implement karein.
    - Content Security Policy (CSP) me wildcard directives avoid karein aur strict CORP (`same-origin`), COEP (`credentialless`), aur HSTS headers enforce karein.
    - Timing attacks ko mitigate karne ke liye crypto operations me `timingSafeEqual` aur non-blocking async notification dispatches (`void sendEmail`) use karein.
- **100% Free Tiers Only:** Only perpetual free tiers (Google Gemini 2.5 Flash, Groq Cloud, Cloudflare Workers, Neon PostgreSQL, Vercel Hobby). No paid APIs, no credit card prerequisites.
- **BIS IS 19000:2022 Compliance:** Zero fake reviews, zero dummy data. All reviews require verified purchase and support edit/delete.
- **Zero-PII Open-Source Turnkey:** Never commit personal names, personal phone numbers, village addresses, personal UPI IDs, or private worker subdomains into code. Use environment variables and database settings.

### Step 3: Local Compile & Lint Verification
Before claiming work is complete, execute:
```bash
npm run typecheck    # Must output 0 errors (tsc --noEmit)
npm run lint         # Must output 0 errors and 0 warnings (eslint .)
```

### Step 4: Build Verification ⚠️ MANDATORY after every major change
> **WHY THIS EXISTS:** `tsc --noEmit` only catches TypeScript type errors. It does NOT catch:
> - Next.js SWC bundler ECMAScript parse errors (e.g., `import dynamic` name collision with `export const dynamic`)
> - Server / Client boundary violations (`"use client"` on wrong component)
> - Dynamic `import()` resolution failures at bundle time
> - Missing `"use client"` directives on components using browser APIs
>
> **Lesson (2026-09-28):** CI build failed with SWC ECMAScript error at `page.tsx:8:31` even though local `tsc --noEmit` passed 0 errors. `npm run build` would have caught it before push.

**Run `npm run build` when ANY of these are true:**
- New `next/dynamic()` or `import()` added
- New API route (`src/app/api/*/route.ts`) created
- `"use client"` or `"use server"` directive added/removed
- New page/layout file (`page.tsx`, `layout.tsx`) added
- Import renamed or `@/` path alias changed
- Large refactor touching 3+ files
- Before every push to remote

```bash
npm run build        # Must complete with 0 errors
                     # Verifies SWC compilation + route segment config
                     # Verifies dynamic import resolution
                     # Verifies server/client boundary contracts
```

> **Performance Note:** `npm run build` takes ~30–60s. For tiny isolated CSS/copy changes, typecheck + lint is acceptable. Use judgment.

### Step 5: Comprehensive Automated Testing
Execute the enterprise test runner:
```bash
npm test             # Must pass 100% of test suites (tests/run-all-tests.ts)
```
- For every new feature or critical fix, **a dedicated test must be written in `tests/`** and registered in `tests/run-all-tests.ts`.

### Step 6: Transparent Change Report & How-To-Test Guide
After completing the changes, you MUST provide the user with:
1. **Change Inventory:** Exactly what files were **Added**, **Modified**, or **Deleted**, with the precise engineering rationale.
2. **Step-by-Step Local Testing Instructions:**
   - Exact CLI commands to run.
   - Exact browser URLs to open (`http://localhost:3000/...`).
   - Specific user actions to perform (e.g., "Click AI Copywriter button in `/seller/products/new`").
   - Expected behavior and visual verification checklist.

### Step 7: Git Discipline — Atomic Logical Batched Commits (Local Only)
> **USER DIRECTIVE: "Tum bs add commit krna main push kr dunga."**
> **BATCHING DIRECTIVE: "Har chhote change pe alag commit na karo — 2-3 related changes pura hone ke baad logical atomic commit karo."**

- **No Micro-Commits:** Do NOT commit on every single tiny line edit, typo fix, or isolated file touch. Running Husky (`tsc` + `eslint` + `commitlint`) on every tiny tweak wastes time and litters the Git history.
- **Batch Related Changes (Logical Unit of Work):** Complete the cohesive task (e.g., Code + Unit Test + Schema/Docs), verify everything via `npm run typecheck` and `npm test`, then make a clean, meaningful, atomic commit.
- **Do NOT Create "Mega-Dumps":** Batch related work only. Do not mix unrelated domains (e.g., an AI endpoint fix should not be lumped into an unrelated auth or database schema overhaul).
- **Commit Format:**
  ```bash
  git add .
  git commit -m "type(scope): concise subject <= 72 characters" -m "- Detailed bullet point 1`n- Detailed bullet point 2"
  ```
- **NEVER execute `git push` directly.** The user will review and run `git push origin main` (or `git push`) themselves.

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
| **⚠️ Build Verification** | `npm run build` | SWC + SWC bundler check — MANDATORY before push |
| **Run All Test Suites** | `npm test` | Runs all 36+ automated enterprise tests |
| **Run Auto-Migration** | `npm run db:auto-migrate` | Safe zero-loss schema auto-sync |
| **Verify Brand Icons** | `npm run icons:verify` | Verifies 53-icon matrix and vector logos |
| **Stage Local Changes** | `git add .` | Stages code locally |
| **Commit Local Changes** | `git commit -m "..."` | Runs Husky pre-commit hooks |
| **Remote Push (User Only)** | `git push origin main` | Always executed by user, never by agent |

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
