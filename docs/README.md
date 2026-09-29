# 📚 AALM VASTRALAY — MASTER DOCUMENTATION INDEX
# Location: docs/README.md

Welcome to the comprehensive documentation hub for **Aalm Vastralay (आलम वस्त्रालय)**. Every production guide, cloud specification, operational runbook, and AI agent contract is cataloged and linked below.

---

## 🏗️ Core Production Infrastructure Manuals

These dedicated, production-grade manuals provide deep architectural breakdowns, CLI commands, real-life verification tests, and error diagnostics:

| Infrastructure Pillar | Master Guide | Focus & Capabilities |
| :--- | :--- | :--- |
| 🐘 **Database Engine** | **[NEON_POSTGRESQL.md](NEON_POSTGRESQL.md)** | Neon Serverless PostgreSQL 16 (Mumbai `ap-south-1`), PgBouncer connection pooling (`-pooler`), zero-loss schema auto-migrations, 1-click clean wipe. |
| ⚡ **Frontend & Compute** | **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** | Next.js 16 SSR/ISR on Vercel Edge, Mumbai/Singapore function regions, custom domain DNS (A + CNAME), zero-downtime releases, instant rollback. |
| 🛡️ **Edge Proxy & CDN** | **[CLOUDFLARE_WORKER.md](CLOUDFLARE_WORKER.md)** | Cloudflare Worker proxy (`b2-proxy.js`), Bandwidth Alliance $0 egress, KV token caching (`B2_TOKEN_KV`), HTTP 206 video range seeking, 1-year immutable edge caching. |
| 📦 **Cold Media Storage** | **[BACKBLAZE_B2.md](BACKBLAZE_B2.md)** | Private bucket (`aalm-vastralay-media`), direct browser presigned uploads (bypassing Vercel 4.5MB ceiling), production CORS rules, lifecycle cleanup. |
| 📧 **Transactional Mailer** | **[GAS_MAILER.md](GAS_MAILER.md)** | 100% free Gmail inbox delivery, zero DNS/SPF/DKIM setup, 450/day circuit breaker, HMAC token auth, 10 luxury royal ethnic email templates. |
| 🔐 **Environment & Secrets** | **[ENV_VARS_PRODUCTION.md](ENV_VARS_PRODUCTION.md)** | 100% production-ready secrets matrix, cryptographic 256-bit key generators (`crypto.randomBytes(32)`), zero mock data, secret rotation playbook. |

---

## 🏛️ System Guides & Operational Manuals (`docs/`)

| Document | Purpose & Description |
| :--- | :--- |
| ⭐ **[MASTER_DEVELOPER_GUIDE.md](MASTER_DEVELOPER_GUIDE.md)** | **PRIMARY REFERENCE** — Full 2000+ word developer & operations manual: architecture diagram, complete `.env` blueprint, cryptographic key generation, step-by-step cloud deployment, live route & UI catalog, 10-feature E2E test matrix, and troubleshooting runbook. |
| 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** | Master production deployment architecture and multi-cloud runbook connecting Vercel, Neon, Cloudflare, and Backblaze B2. |
| 🏛️ **[TECH_STACK_AND_ARCHITECTURE.md](TECH_STACK_AND_ARCHITECTURE.md)** | **Deep Technology Stack & Architecture Breakdown** — Layer-by-layer analysis of Next.js 16, React 19, Tailwind 4, Neon, Drizzle, Backblaze B2, PoW Shield, and execution environments. |
| **[COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)** | Complete end-to-end platform guide: features, architecture, stores, payment methods, and admin customization. |
| **[ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md)** | Step-by-step `.env` configuration guide with Neon, ImageKit, Cloudflare, and Vercel setup. |
| 🛡️ **[SECRETS_AND_CONFIGURATION_MATRIX.md](SECRETS_AND_CONFIGURATION_MATRIX.md)** | **Master Data & Secret Classification** — Comprehensive plain text vs. private secret matrix, risk levels, and leak prevention. |
| **[GAS_EMAIL_GUIDE.md](GAS_EMAIL_GUIDE.md)** | 100% Free zero-domain Google Apps Script OTP & email notification engine setup. |
| **[SETUP.md](SETUP.md)** | Complete local development (`npm run dev`) and live production setup runbook. |
| **[ICONS.md](ICONS.md)** | Complete 53-icon matrix, 20 SVG logos (4 colorways), 3 watermarks, and PWA manifest system. |
| **[BRAND.md](BRAND.md)** | Complete 12-section brand identity specification, typography, usage rules, and voice. |
| **[architecture.md](architecture.md)** | Multi-tier architecture blueprint, edge routing, data flow, and external service topologies. |
| **[runbook.md](runbook.md)** | Production maintenance, database backup, log auditing, and disaster recovery procedures. |
| **[SECURITY.md](SECURITY.md)** | Public security policy, coordinated vulnerability disclosure, and cryptographic specs. |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Code contribution guidelines, TypeScript strict mode, and pull request checklist. |
| **[B2_CORS.md](B2_CORS.md)** | Backblaze B2 bucket CORS setup runbook (Hindi): exact JSON rules, CLI commands, and browser console symptom-fix table. |
| **[cloudflare-worker/README_DEPLOY.md](../cloudflare-worker/README_DEPLOY.md)** | 8-Step Cloudflare Worker deployment runbook (Hindi + English) with KV binding and secrets setup. |
| **[TERMS.md](TERMS.md)** | Indian Contract Act & IT Act compliant Terms of Service for buyers, sellers, and marketplace. |
| **[PRIVACY.md](PRIVACY.md)** | DPDP Act 2023 compliant Privacy Policy, customer PII masking, cookie consent, and data retention rules. |

---

## 🧠 AI Agent Architecture & System Contracts (`.ai/`)

| AI Context Document | Purpose & Description |
| :--- | :--- |
| **[.ai/RULES.md](../.ai/RULES.md)** | **Non-negotiable golden rules:** 0 `any` types, zero data loss, strict backward compatibility. |
| **[.ai/CONTEXT.md](../.ai/CONTEXT.md)** | Verified live system state, active integrations, 55 compiled routes, and database tables. |
| **[.ai/CHANGELOG.md](../.ai/CHANGELOG.md)** | Detailed chronological history of all features, optimizations, and security patches. |
| **[.ai/TODO.md](../.ai/TODO.md)** | Project roadmap, active sprints, and prioritized upcoming enhancements. |
| **[.ai/DATABASE.md](../.ai/DATABASE.md)** | Zero-loss migration protocol (`ADD COLUMN IF NOT EXISTS`), index strategy, and pooler rules. |
| **[.ai/PRD.md](../.ai/PRD.md)** | Functional specifications, user stories, role boundaries, and business rules. |
| **[.ai/API.md](../.ai/API.md)** | REST API and Server Action contract specifications with input validation schemas. |
| **[.ai/DESIGN_SYSTEM.md](../.ai/DESIGN_SYSTEM.md)** | Indian ethnic luxury color palette, APCA contrast rules, and Bento Grid 2.0 specs. |
| **[.ai/SECURITY.md](../.ai/SECURITY.md)** | Defensive security model: rate limiting, CSRF defense, scrypt hashing, AES-256-GCM cipher. |
| **[.ai/PROMPTS/MASTER_SYSTEM.md](../.ai/PROMPTS/MASTER_SYSTEM.md)** | Production-Grade Master Vibe Coding Playbook for autonomous development. |

---

## 🚀 Root Files & Entry Points

- **[`README.md`](../README.md)** — Main repository landing page.
- **[`GEMINI.md`](../GEMINI.md)** — Mandatory AI agent workflow instructions.
- **[`CLAUDE.md`](../CLAUDE.md)** — Claude code workflow rules.
