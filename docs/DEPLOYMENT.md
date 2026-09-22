# 🚀 AALM VASTRALAY — PRODUCTION DEPLOYMENT GUIDE
# Location: docs/DEPLOYMENT.md

## 1. Hosting Platforms
- **Edge Runtime:** Cloudflare Workers (via OpenNext) or Node.js Docker container.
- **Database:** Neon Serverless PostgreSQL with pooling enabled.
- **Static Assets:** Cloudflare CDN / public assets.

## 2. Production Environment Variables Checklist

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Neon Postgres pooled connection string | `postgresql://...` |
| `ENCRYPTION_KEY` | 32-byte hex key for AES-256 data protection | `64 character hex` |
| `ADMIN_EMAIL` | Official super admin login email | `admin@aalmvastralay.com` |
| `ADMIN_PASSWORD`| Initial super admin bootstrap password | `StrongSecret@2026` |
| `NEXT_PUBLIC_APP_URL` | Live production domain URL | `https://aalmvastralay.in` |

## 3. Deployment Steps
1. Push code to the `main` branch.
2. The GitHub Actions CI pipeline automatically runs `npm test`, `npm run typecheck`, and `npm run lint`.
3. OpenNext builds the production bundle and deploys to Cloudflare Workers.
4. Database tables and settings auto-provision smoothly on initial startup.
