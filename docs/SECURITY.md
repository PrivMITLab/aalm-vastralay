# 🛡️ AALM VASTRALAY — PUBLIC SECURITY POLICY
# Location: docs/SECURITY.md

## 1. Security Philosophy
Aalm Vastralay adopts a zero-trust, privacy-first posture for customer and seller data.

## 2. Reporting Vulnerabilities
If you discover a security flaw or vulnerability:
- Please report it directly to: `security@aalmvastralay.in`
- Do NOT open public GitHub issues for security vulnerabilities.
- Provide reproduction steps and proof of concept.

## 3. Defense Mechanisms in Place
- **Data at Rest:** AES-256-GCM authenticated cipher for sensitive tokens and keys.
- **Data in Transit:** TLS 1.3 encrypted connections.
- **Access Control:** Multi-tenant row-level authorization preventing cross-store data access.
- **Brute Force Defense:** Progressive account lockout and IP rate limiting.
- **PII Redaction:** Phone and email addresses masked in logs and reports.
