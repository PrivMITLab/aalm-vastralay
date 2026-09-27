# Changelog

All notable changes to **Aalm Vastralay** (आलम वस्त्रालय) will be documented in this file.

> This file is **automatically generated** by [release-please](https://github.com/googleapis/release-please)
> on every push to `main` branch. Do **NOT** edit this file manually.
>
> Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
> and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-09-27

### ✨ Features
- Multi-vendor Indian ethnic wear marketplace (Sarees, Lehengas, Sherwanis, Kurtas)
- Self-hosted DiceBear Lorelei avatar system at `/api/avatar` (zero upload friction)
- `<UserAvatar>` in header trigger, dropdown, and mobile drawer
- Dynamic UPI QR Code checkout (₹0 gateway fee) with 5-minute timer
- Click-to-Solve self-hosted PoW bot defense (10 archetypes)
- Admin 1-click marketing broadcast center (`/admin/marketing`)
- Flipkart/Myntra-style 5-slide auto-rotating hero carousel
- Smart catalog visual filters (occasions, color swatches, fabrics)
- Indian pincode circle resolution & COD delivery estimator

### 🔒 Security
- Anti-replay PoW single-use store (`pow_used` table)
- Fail-closed rate limiting with strict IPv4/IPv6 validation
- PII masking (`maskPhone`, `maskEmail`) across admin/seller views
- Magic byte validation on all uploads (JPEG, PNG, WebP, AVIF, GIF, SVG)
- SSRF defense firewall for all external image fetch endpoints
- Zero-information-leakage guarantee across all 26 API routes

### ⚡ Performance
- Header query diet: single combined SQL, guest fast-path bypass
- `unstable_cache` with `site-settings` tag (revalidate 3600s)
- wsrv.nl WebP compression (quality=70) + 7-day Cache-Control headers
- Cloudflare Worker B2 proxy with 1-year immutable edge caching

### 🔧 Build System
- Automated versioning with `release-please` (SemVer, stays in 0.x.x)
- `commitlint` with Conventional Commits enforcement via Husky
- `NEXT_PUBLIC_APP_VERSION` injected from `package.json` at build time
- `<VersionBadge>` component in footer (Beta for 0.x.x, Stable for 1.x.x+)

---

*Next release notes will be automatically generated here by release-please.*
