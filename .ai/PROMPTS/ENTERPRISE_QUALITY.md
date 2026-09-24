# ================================================================================
# ENTERPRISE QUALITY & TESTING PROMPT — AALM VASTRALAY
# Location: .ai/PROMPTS/ENTERPRISE_QUALITY.md
# ================================================================================

Use this prompt to run zero-defect verification across all 16 test suites, static analysis, type checking, and production builds.

## Verification Matrix
1. `npm test` — 100% test suites pass in `tests/run-all-tests.ts`.
2. `npm run typecheck` — 0 TypeScript errors under strict mode (0 `any` types).
3. `npm run lint` — 0 warnings, 0 errors.
4. `npm run build` — Turbopack compiles all routes cleanly.
5. All 5 media sources remain 100% functional.
