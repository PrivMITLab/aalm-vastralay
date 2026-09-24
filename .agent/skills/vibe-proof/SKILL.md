---
name: vibe-proof
description: Parallel full-stack security and regression audit across frontend, backend, database, and CI/CD configurations.
license: MIT
metadata:
  version: 1.0.0
  category: security-hardening
  tags: vibe-proof, audit, static-analysis, zero-defect
---

# Vibe Proof Full-Stack Hardening

## Parallel Audit Tracks
1. **Frontend Track:**
   - Verify all `<form>` tags use double-submit prevention and loading indicators.
   - Verify no secrets or sensitive environment variables are prefixed with `NEXT_PUBLIC_`.
   - Ensure all user inputs are sanitized before rendering.
2. **Backend & API Track:**
   - Verify every Server Action has authentication verification (`requireUser` or `getCurrentUser`).
   - Ensure rate limiting is enforced on public endpoints.
   - Check error handling: Never leak SQL errors or stack traces to client.
3. **Database Track:**
   - Verify all migrations follow additive pattern (`ADD COLUMN IF NOT EXISTS`).
   - Check foreign key indices and compound query indices.
4. **DevOps & Supply Chain Track:**
   - Automated CI testing workflow (`ci.yml`).
   - Static security analysis (CodeQL, Semgrep, dependency auditing).
