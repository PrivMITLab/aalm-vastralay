# ⚡ Vercel — Master Production Deployment Manual
**Location:** `docs/VERCEL_DEPLOYMENT.md`  
**Framework:** Next.js 16 (App Router + Turbopack + React 19)  
**Edge Region Target:** `ap-south-1` (Mumbai) / `sin1` (Singapore)

---

## 📌 Production Architecture Overview

The web marketplace frontend and API backend are hosted on Vercel's global edge network, delivering zero-downtime serverless execution for Next.js 16:

```mermaid
flowchart TD
    DNS[DNS Provider / Cloudflare\naalmvastralay.com] -->|HTTPS 443| VercelEdge[Vercel Edge Network / Anycast CDN]
    VercelEdge -->|Static Assets / _next/static| EdgeCache[Vercel Immutable Edge Cache]
    VercelEdge -->|SSR / Server Actions / API Routes| Serverless[Vercel Fluid Serverless Compute\nNode.js 20.x runtime]
    Serverless -->|Neon Connection Pooler\nDATABASE_URL| NeonDB[(Neon Serverless PostgreSQL\nap-south-1 Mumbai)]
    Serverless -->|Media Stream Request| CFWorker[Cloudflare Worker B2 Proxy\nNEXT_PUBLIC_B2_WORKER_URL]
    Serverless -->|OTP / Email Webhook| GASMailer[Google Apps Script Mailer\nGAS_WEBHOOK_URL]
```

### Key Production Requirements:
1. **Serverless Connection Pooling:** Must always connect to Neon via `-pooler` connection string (`ep-cool-flower-xxxxxx-pooler.ap-south-1.aws.neon.tech`) to prevent connection pool exhaustion during concurrent traffic spikes.
2. **Function Execution Region:** Must configure the serverless function region close to the database (`ap-south-1` Mumbai or `sin1` Singapore) in `vercel.json` to minimize database query roundtrip latency.
3. **4.5 MB Serverless Payload Limit:** Uploading large photos/videos through standard POST routes fails on Vercel's 4.5 MB serverless body size ceiling. Aalm Vastralay solves this by generating B2 presigned URLs (`/api/uploads/presign`) and streaming media directly from the client's browser to Backblaze B2.
4. **Zero-Downtime Database Bootstrap:** A single secured POST call to `/api/bootstrap` safely creates all 17 schema tables without table locking or data destruction.

---

## ⚙️ Production `vercel.json` Configuration

In the repository root, `vercel.json` provides strict configuration for function regions, timeouts, and security headers:

```json
{
  "framework": "nextjs",
  "regions": ["bom1", "sin1"],
  "functions": {
    "src/app/api/**/*": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## 🚀 Step-by-Step Production Deployment

### Method A: Git-Integrated Automated CI/CD (Recommended)

1. **Connect GitHub to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository: `SudhirDevOps1/aalm-vastralay`.
   - **Framework Preset:** `Next.js` (automatically detected).
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (or leave default).
   - **Output Directory:** `.next` (default).

2. **Add Production Environment Variables:**
   - In the Vercel project configuration screen, open the **Environment Variables** accordion.
   - Enter all required keys (see Section below or [`docs/ENV_VARS_PRODUCTION.md`](ENV_VARS_PRODUCTION.md)).
   - Ensure the scopes are checked for **Production**, **Preview**, and **Development**.

3. **Trigger Deployment:**
   - Click **Deploy**. Vercel will clone the repository, run `npm install`, compile TypeScript strict types, execute Tailwind CSS v4 bundling, and publish the deployment to an immutable preview and production URL.

---

### Method B: Vercel CLI (Direct Production Push)

For terminal operations and headless deployment:

```bash
# 1. Install or run Vercel CLI
npx vercel login

# 2. Link your local directory to the Vercel project
npx vercel link

# 3. Pull existing project settings
npx vercel env pull .env.production.local

# 4. Trigger production build & deployment
npx vercel --prod
```

---

## 🔑 Complete Production Environment Variables on Vercel

Add the following variables to **Project Settings -> Environment Variables** in the Vercel Dashboard:

| Key | Example Production Value | Sensitivity | Scope |
|:---|:---|:---|:---|
| `DATABASE_URL` | `postgresql://neondb_owner:PASSWORD@ep-xxxxxx-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require` | 🔒 Private Secret | Production, Preview |
| `AUTH_SECRET` | `e9b2f4c781d0a5e38f12c67b94d183f05a76c82e91b45f3a7c2e81d094b72e15` | 🔒 Private Secret | Production, Preview |
| `ENCRYPTION_SECRET` | `7a1f2b641a26c9a227fbf3d59a2a45dcb945eb98a6f4e2a34d14207f6415e6c6` | 🔒 Private Secret | Production, Preview |
| `POW_SECRET` | `aalm_pow_shield_super_secure_key_2026` | 🔒 Private Secret | Production, Preview |
| `COOKIE_SECURE` | `true` | ⚙️ Config | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://aalmvastralay.com` | 🌐 Public URL | Production, Preview |
| `NEXT_PUBLIC_B2_WORKER_URL` | `https://media.aalmvastralay.com` | 🌐 Public URL | Production, Preview |
| `B2_KEY_ID` | `004e8b9...` | 🔒 Private Secret | Production, Preview |
| `B2_APP_KEY` | `K004...` | 🔒 Private Secret | Production, Preview |
| `B2_BUCKET_ID` | `a1b2c3d4e5f6...` | 🔒 Private Secret | Production, Preview |
| `B2_BUCKET_NAME` | `aalm-vastralay-media` | ⚙️ Config | Production, Preview |
| `GAS_WEBHOOK_URL` | `https://script.google.com/macros/s/AKfycb.../exec` | 🔒 Private Secret | Production, Preview |
| `GAS_SECRET_TOKEN` | `aalm_gas_mail_secret_9988224411` | 🔒 Private Secret | Production, Preview |
| `ADMIN_EMAIL` | `admin@aalmvastralay.com` | 🔒 Private Secret | Production |
| `ADMIN_PASSWORD` | `SuperStrongPassword@2026` | 🔒 Private Secret | Production |
| `BOOTSTRAP_TOKEN` | `aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c` | 🔒 Private Secret | Production |
| `SKIP_SEED` | `true` | ⚙️ Config | Production |

---

## 🌐 Custom Domain & DNS Setup

To link your primary domain (`aalmvastralay.com` and `www.aalmvastralay.com`):

1. In Vercel, navigate to **Settings -> Domains**.
2. Add `aalmvastralay.com` (select redirect `www.aalmvastralay.com` to `aalmvastralay.com`).
3. Configure your DNS provider:

| Type | Name / Host | Target / Value | TTL |
|:---|:---|:---|:---|
| **A** | `@` (apex) | `76.76.21.21` | Auto (or 300) |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Auto (or 300) |

> [!NOTE]
> If your DNS is managed through Cloudflare:
> - Set the Cloudflare Proxy status to **DNS only (Grey Cloud)** during domain verification.
> - Once verified and SSL is issued by Vercel, you can optionally switch to **Proxied (Orange Cloud)** with Cloudflare SSL mode set to **Full (Strict)**.

---

## 🔄 One-Time Production Database Bootstrap

After the first deployment completes, run the secure zero-downtime bootstrap endpoint via POST:

### Bash / Linux / Mac:
```bash
curl -X POST "https://aalmvastralay.com/api/bootstrap?token=aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c&clean=true"
```

### Windows (PowerShell):
```powershell
Invoke-RestMethod -Method Post -Uri "https://aalmvastralay.com/api/bootstrap?token=aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c&clean=true"
```

**Expected JSON Response:**
```json
{
  "success": true,
  "message": "Database schema bootstrapped successfully.",
  "tablesCreated": 17,
  "adminCreated": true,
  "adminEmail": "admin@aalmvastralay.com",
  "seedSkipped": true
}
```

---

## 🚨 Instant Rollback Playbook

If a critical runtime regression occurs in production:
1. Open **Vercel Dashboard -> Deployments**.
2. Identify the last known stable deployment.
3. Click the **three dots (...)** next to it -> **Instant Rollback**.
4. Traffic will instantly route to the previous build without requiring a recompilation or git revert.
5. Or via CLI:
   ```bash
   npx vercel rollback <deployment-id-or-url>
   ```
