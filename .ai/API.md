# 🌐 AALM VASTRALAY — API DOCUMENTATION
# Location: .ai/API.md

## 1. Standard Response Formats

### Successful Response:
```json
{
  "ok": true,
  "data": { ... }
}
```

### Error Response:
```json
{
  "ok": false,
  "error": "Human-readable safe error message",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## 2. API Endpoints Catalog

### `GET /api/health`
- **Purpose:** Cloudflare & uptime health probe.
- **Access:** Public.
- **Response:** `{ "status": "ok", "timestamp": "...", "neon": "connected" }`.

### `GET /api/diagnostic`
- **Purpose:** Full database connectivity, table count, and configuration diagnostics.
- **Access:** Admin only.
- **Response:** Summary of 16 tables, row counts, and environment health.

### `GET /api/products`
- **Purpose:** Fetch catalog products with pagination, search, category, and sorting filters.
- **Query Params:** `category`, `search`, `sort`, `page`, `limit`.
- **Response:** `{ "products": [...], "total": 120, "page": 1, "totalPages": 5 }`.

### `POST /api/newsletter`
- **Purpose:** Customer email subscription.
- **Protection:** Rate limited (5 req/min per IP), email regex validation.
- **Response:** `{ "ok": true, "message": "Subscribed successfully" }`.

### `POST /api/search/suggest`
- **Purpose:** Instant autocomplete suggestions for sarees, lehengas, kurtas, and sherwanis.
- **Response:** `{ "suggestions": [...] }`.

### `POST /api/security/challenge`
- **Purpose:** Altcha-style proof-of-work challenge generation for bot defense.
- **Response:** `{ "challenge": "...", "maxnumber": 100000, "salt": "..." }`.

### `POST /api/uploads/product`
- **Purpose:** Secure multi-part product photo upload for sellers.
- **Validation:** MIME whitelist (`image/jpeg`, `image/png`, `image/webp`), max 5MB, SHA-256 filename hashing.
- **Access:** Authenticated Sellers and Admins.

### `POST /api/webhooks/clerk`
- **Purpose:** User synchronization webhook.
- **Protection:** HMAC Svix signature verification.
