# 🛡️ AALM VASTRALAY — PUBLIC SECURITY POLICY
# Location: docs/SECURITY.md

## 1. Security Philosophy
Aalm Vastralay adopts a zero-trust, privacy-first posture for customer, seller, and marketplace data. All transactions and administrative operations run through multi-layer verification.

## 2. Reporting Vulnerabilities
If you discover a security flaw or vulnerability:
- Please report it directly to: `security@aalmvastralay.in`
- Do NOT open public GitHub issues for security vulnerabilities.
- Provide reproduction steps and proof of concept.

## 3. Defense Mechanisms in Place
- **Bot Defense (Turnstile-Style PoW):** Self-hosted Proof-of-Work challenge solver (`ClickToSolve.tsx`) running in an inline Web Worker. Zero external dependencies, no third-party tracking, and zero API costs.
- **Anti-Replay Security Store:** Consumed PoW tokens are atomically recorded in the `pow_used` table with conflict rejection, completely blocking replay attacks.
- **Inspect-Element Bypass Prevention:** Form submit buttons are locked client-side until PoW is solved, and server actions strictly enforce PoW verification even if client DOM attributes are modified in DevTools.
- **Cellular IP Drift Resilience:** PoW tokens bind to IPv4 `/24` (first 3 octets) and IPv6 `/64` subnets, allowing legitimate Indian mobile shoppers (Jio, Airtel) to switch cellular towers without session invalidation while blocking cross-network token transplants.
- **Fail-Closed Rate Limiting:** In-memory and database rate-limiting with strict IPv4/IPv6 regex validation (`isValidIp`). Sensitive routes fail-closed upon error.
- **Data at Rest:** AES-256-GCM authenticated cipher for sensitive tokens and keys.
- **Data in Transit:** TLS 1.3 encrypted connections.
- **Access Control:** Multi-tenant row-level authorization preventing cross-store data access.
- **Brute Force Defense:** Progressive account lockout and IP rate limiting.
- **PII Redaction:** Phone and email addresses masked in logs and reports.
- **Button Double-Click Defense:** Atomic re-entry guard hook `useFormLock()` preventing duplicate order creation.
