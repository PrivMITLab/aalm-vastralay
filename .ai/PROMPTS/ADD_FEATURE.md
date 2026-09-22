# 🚀 PROMPT TEMPLATE: ADD NEW FEATURE
# Location: .ai/PROMPTS/ADD_FEATURE.md

When asking an AI agent to add a new feature to this project, use this prompt structure:

```markdown
I want to add the following feature: [DESCRIBE FEATURE]

STRICT SAFETY RULES:
1. First read .ai/RULES.md, .ai/CONTEXT.md, and .ai/ARCHITECTURE.md.
2. DO NOT delete, break, or remove any existing feature.
3. If database changes are needed:
   - Use ADD COLUMN IF NOT EXISTS with DEFAULT values.
   - NEVER drop tables, columns, or rename existing columns.
   - Ensure existing data remains 100% intact.
4. Follow TypeScript strict mode with 0 `any` types.
5. Provide automated test coverage in `tests/`.
6. Run `npm test`, `npm run typecheck`, and `npm run build` to verify 0 errors.
7. Update .ai/CHANGELOG.md and .ai/TODO.md once complete.
```
