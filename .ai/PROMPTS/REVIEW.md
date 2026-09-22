# 🧐 PROMPT TEMPLATE: CODE REVIEW & AUDIT
# Location: .ai/PROMPTS/REVIEW.md

When asking an AI agent to review changes or audit code in this project, use this prompt structure:

```markdown
Please perform a rigorous security, performance, and code quality audit of: [FILES OR PR]

AUDIT CHECKLIST:
1. Verify against .ai/RULES.md (Golden Rules, Security, Database, UI/UX).
2. Check for secret leaks, PII exposures, and missing rate limits.
3. Check for SQL safety — are all queries parameterized via Drizzle?
4. Check for TypeScript safety — any `any` types or `eslint-disable` workarounds?
5. Check accessibility (WCAG AA), contrast ratios, and touch target sizes.
6. Check database changes — are they additive-only with DEFAULT values?
7. Run `npm test`, `npm run typecheck`, and `npm run lint`.
8. Output findings categorized by Critical, Warning, and Informational.
```
