# Operator runbook

A 60-second field guide for what to do when something on Aalm Vastralay breaks. Every action links to the relevant admin screen so you can react from a phone.

## 🟢 Service health

| Symptom | First check | Fix |
| --- | --- | --- |
| `/api/health` returns `{ok:false}` | Neon status page (`https://neonstatus.com`) | If Neon is up, check connection-pool exhaustion in `audit_logs`; restart the page. |
| 500s on `seller.orders` | `/admin/security` → last 80 entries | If a single actor shows multiple 429s, raise `security.formRateLimit` or unlock the account. |
| Email confirmations not arriving | `audit_logs` → search for `order.place` | `QUIETMAIL_API_*` missing? Messages are logged to the server console until keys are set. |
| Bot shield slow / blocking real users | `/admin/settings?group=security` | Lower `security.powDifficulty` from 3 to 2 (≈ 16× faster). |
| Sign-in lockouts | `/admin/security` → "Recent failed sign-ins" | Truncate `login_attempts` or wait `security.lockMinutes`. |
| Catalogue empty after deploy | `scripts/db-bootstrap.ts` | `npm run db:bootstrap` — idempotent, will create missing tables and re-add settings. |

## 🚀 Deploy

```bash
git push origin main
# Cloudflare Pages auto-builds → https://aalm-vastralay.pages.dev
# ImageKit / B2 / quiet-mail keys are read from Cloudflare env vars (no rebuild needed).
```

For a manual cut-over:

```bash
npm ci
npm run db:bootstrap       # creates any missing tables + settings rows
npm run build
# Upload `.next/` to your host or `wrangler pages deploy .vercel/output/static`
```

## 🛟 Common tasks

| Task | How |
| --- | --- |
| Disable a coupon | `/admin` → Coupons row → toggle |
| Suspend a seller | `/admin` → Stores → Suspend |
| Add a new top-level category | `/admin` → Categories → Add |
| Refund a single order | `/seller/orders` → set status to `cancelled` (refund tracks in audit log) |
| Adjust commission window | `/admin/settings?group=seller` → `Commission-free months` |
| Whitelist a corporate IP | `/admin/settings?group=security` → keep `Trusted proxy headers` on; the edge already honours `cf-connecting-ip` |

## 🧪 Smoke tests after a release

```bash
curl -fsS https://<site>/api/health | grep '"ok":true'
curl -fsS https://<site>/api/security/challenge | grep '"enabled":true'
curl -fsS https://<site>/sitemap.xml | head
curl -fsS https://<site>/robots.txt | head
```

## 📈 Capacity triggers (what to upgrade first)

| Metric | Free tier cap | Upgrade to |
| --- | --- | --- |
| Neon rows ≈ 200 MB | 0.5 GB | Neon Launch plan ($19/mo) |
| ImageKit bandwidth ≈ 20 GB | 20 GB / mo | ImageKit Starter ($25/mo) |
| Cloudflare Pages requests | unlimited | stay free |
| Cloudflare Worker B2 proxy | 100k / day | stay free, or swap to R2 |
| Sign-in active users | 50k MAU (Clerk) | Clerk Pro when swapped in |
