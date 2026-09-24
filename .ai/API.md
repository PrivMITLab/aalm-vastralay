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

### `GET /api/categories`
- **Purpose:** Hierarchical category tree with subcategories and live product counts.
- **Access:** Public (Edge cached, `s-maxage=300`).
- **Response:** `{ "count": 12, "categories": [{ "id": "...", "name": "...", "subcategories": [...] }] }`.

### `GET /api/search`
- **Purpose:** Full-text PostgreSQL search endpoint across titles, descriptions, and tags.
- **Query Params:** `q`, `limit`.
- **Access:** Public (Edge cached, `s-maxage=60`).
- **Response:** `{ "query": "...", "count": 8, "products": [...] }`.

### `GET /api/admin/*` (Users, Sellers, Products, Orders, Coupons, Banners, Settings)
- **Purpose:** Headless administrative data extraction and dashboard feeds.
- **Access:** Admin only (`role = 'admin'`).
- **Endpoints:**
  - `GET /api/admin/users`: List registered customers and sellers with role and timestamps.
  - `GET /api/admin/sellers`: List store owners, locations, sales totals, and active statuses.
  - `GET /api/admin/products`: List all catalog products with store names and inventory numbers.
  - `GET /api/admin/orders`: List order items, payment status, totals, and customer references.
  - `GET /api/admin/coupons`: List active coupon codes, discount types, and redemption metrics.
  - `GET /api/admin/banners`: Retrieve active promotional hero banners and settings.
  - `GET /api/admin/settings`: Retrieve all zero-code configuration settings map.

