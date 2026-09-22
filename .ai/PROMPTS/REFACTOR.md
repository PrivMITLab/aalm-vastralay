# 🔧 PROMPT TEMPLATE: CODE REFACTOR
# Location: .ai/PROMPTS/REFACTOR.md

When asking an AI agent to refactor code in this project, use this prompt structure:

```markdown
I want to refactor: [SPECIFY MODULE / FILE / COMPONENT]

STRICT SAFETY RULES:
1. First read .ai/RULES.md, .ai/CONTEXT.md, and .ai/ARCHITECTURE.md.
2. The refactoring MUST be purely structural — zero functional regressions, zero feature removals.
3. Keep all public API signatures, props, and database schemas identical.
4. Maintain strict TypeScript types (0 `any`).
5. Run the enterprise test suite (`npm test`) before and after refactoring to prove zero regressions.
6. Verify `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.
7. Record the refactoring in .ai/CHANGELOG.md.
```
