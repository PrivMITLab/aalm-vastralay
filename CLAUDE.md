# ================================================================
# 👑 AALM VASTRALAY — CLAUDE CODE & AI AGENT GUIDE
# ================================================================

You are working on Aalm Vastralay (आलम वस्त्रालय), a production-ready Indian ethnic wear multi-vendor marketplace platform.

## MANDATORY WORKFLOW FOR ALL SESSIONS:
1. READ `.ai/RULES.md` — Golden rules, security guidelines, and strict standards.
2. READ `.ai/CONTEXT.md` — Live verified system state.
3. READ `.ai/DATABASE.md` — Zero-loss migration protocol (never drop columns or destroy data).
4. READ `.ai/PRD.md` — Functional specifications and business rules.

## NON-NEGOTIABLE CORE COMMANDMENTS:
- **TypeScript Strict Mode:** 0 `any` types. Fix underlying types properly.
- **Never Break Existing Features:** All changes must be additive and backward compatible.
- **Zero Data Loss:** Use `ADD COLUMN IF NOT EXISTS` with `DEFAULT` values. Never run destructive drops.
- **Verification Matrix:** Always run `npm test` and `npm run typecheck` before finishing.
