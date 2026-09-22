# 🤝 CONTRIBUTING TO AALM VASTRALAY
# Location: docs/CONTRIBUTING.md

Thank you for contributing to Aalm Vastralay!

## Golden Rules for Contributors & AI Agents
1. **Read `.ai/RULES.md` First:** All 12 sections are strictly enforced.
2. **TypeScript Strict Mode:** 0 `any` types allowed.
3. **Additive Database Changes:** Never drop tables or columns. Always use `ADD COLUMN IF NOT EXISTS ... DEFAULT ...`.
4. **Automated Tests:** Add automated test coverage in `tests/` for new logic.
5. **Verification Matrix:** Run `npm test`, `npm run typecheck`, and `npm run lint` before opening a Pull Request.
