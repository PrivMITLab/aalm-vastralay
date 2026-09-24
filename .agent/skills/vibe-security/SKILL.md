---
name: vibe-security
description: Production-grade security playbook covering input validation, API rate limiting, CSRF defense, cryptographic hashing, and data sanitization.
license: MIT
metadata:
  version: 1.0.0
  category: security-defense
  tags: security, validation, rate-limiting, csrf, cryptography, owasp
---

# Vibe Security Skill

## Defensive Commandments
1. **Input Validation (Zod):**
   - Every server action and API endpoint MUST validate input schemas strictly. Strip unexpected fields, enforce regex on phone, email, and pin code.
2. **Brute-Force & Denial of Service Defense:**
   - IP and user-level rate limiting using token-bucket or fixed-window counters with exponential backoff.
   - Proof-of-Work (ALTCHA / custom PoW) on high-risk endpoints (orders, reviews, authentication).
3. **Cross-Site Request Forgery (CSRF):**
   - Verify `Origin` and `Host` headers on all state-changing POST/PUT requests. Reject cross-origin mutations.
4. **Information Leakage Prevention:**
   - Never surface database error strings, stack traces, or file paths in API responses or user-facing toasts.
   - Return clean, actionable error messages with internal tracking request IDs.
5. **PII Masking & Confidentiality:**
   - Mask phone numbers (`******1342`) and email addresses (`c***r@domain.com`) in administrative logs and seller views.
   - Encrypt sensitive data using AES-256-GCM.
