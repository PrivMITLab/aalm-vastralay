# 🐛 PROMPT TEMPLATE: FIX A BUG
# Location: .ai/PROMPTS/FIX_BUG.md

When asking an AI agent to fix a bug in this project, use this prompt structure:

```markdown
I have encountered a bug: [DESCRIBE BUG SYMPTOM & REPRODUCTION STEPS]

STRICT SAFETY RULES:
1. First read .ai/RULES.md, .ai/CONTEXT.md, and .ai/BUGS.md.
2. DO NOT delete working code or rewrite entire files unnecessarily.
3. Diagnose the root cause precisely before modifying code.
4. If database data is involved:
   - NEVER drop tables, columns, or truncate data.
   - Respect zero-data-loss migration rules in .ai/DATABASE.md.
5. Fix the underlying type properly — NO `any` types, NO `eslint-disable`.
6. Run `npm test` and `npm run typecheck` to verify the fix.
7. Document the incident in .ai/BUGS.md and update .ai/CHANGELOG.md.
```
