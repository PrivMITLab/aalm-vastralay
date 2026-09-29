# 🔐 Master Production Environment Variables & Secrets Reference
**Location:** `docs/ENV_VARS_PRODUCTION.md`  
**Security Standard:** Strict Zero-Leak Protocol (OWASP Top 10 + DPDP Act 2023)

---

## 📌 Production Environment Architecture

This document defines the **100% production-ready** configuration matrix for **Aalm Vastralay**. No placeholder or mock values are permitted in production builds.

```mermaid
flowchart TD
    subgraph Vercel Production Environment
        DB_URL[DATABASE_URL]
        AUTH[AUTH_SECRET]
        ENC[ENCRYPTION_SECRET]
        POW[POW_SECRET]
        B2_VARS[B2_KEY_ID / B2_APP_KEY / B2_BUCKET_ID]
        GAS_VARS[GAS_WEBHOOK_URL / GAS_SECRET_TOKEN]
        OAUTH_VARS[GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET]
    end

    subgraph Cloudflare Worker Environment
        CF_KV[[B2_TOKEN_KV]]
        CF_SECRETS[B2_KEY_ID / B2_APP_KEY]
        CF_VARS[B2_BUCKET_NAME]
    end

    subgraph Google Apps Script Environment
        GAS_SECRET[GAS_SECRET_TOKEN]
    end

    VercelProduction --> DB_URL
    VercelProduction --> CF_SECRETS
    VercelProduction --> GAS_SECRET
```

---

## 🛠️ Cryptographic Key Generation Commands

Generate cryptographically secure 256-bit random keys in your terminal using standard Node.js:

```bash
# 1. Generate AUTH_SECRET (64 hex characters / 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Generate ENCRYPTION_SECRET (64 hex characters / 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Generate POW_SECRET (Bot Defense Signature Key)
node -e "console.log('aalm_pow_' + require('crypto').randomBytes(24).toString('hex'))"

# 4. Generate BOOTSTRAP_TOKEN (One-Time Database Initializer)
node -e "console.log('aalm_boot_' + require('crypto').randomBytes(16).toString('hex'))"

# 5. Generate GAS_SECRET_TOKEN (Google Apps Script Shared Key)
node -e "console.log('aalm_gas_mail_' + require('crypto').randomBytes(16).toString('hex'))"
```

---

## 📋 Comprehensive Production Environment Matrix

### 1. Database (Neon Serverless PostgreSQL)
| Variable | Required | Scope | Description & Production Example | Where to Obtain |
|:---|:---:|:---|:---|:---|
| `DATABASE_URL` | **Yes** | Vercel, Local Prod | `postgresql://neondb_owner:PASSWORD@ep-xxxxxx-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require`<br>*(Must include `-pooler`)* | [Neon Console](https://console.neon.tech) -> Project -> Dashboard -> Pooled connection checkbox |

### 2. Authentication, Session & Cryptography
| Variable | Required | Scope | Description & Production Example | Where to Obtain |
|:---|:---:|:---|:---|:---|
| `AUTH_SECRET` | **Yes** | Vercel, Local Prod | 64-char hex string (Better Auth JWT & session signing) | Generated via `crypto.randomBytes(32)` |
| `ENCRYPTION_SECRET` | **Yes** | Vercel, Local Prod | 64-char hex string (AES-256-GCM customer data encryption) | Generated via `crypto.randomBytes(32)` |
| `POW_SECRET` | **Yes** | Vercel, Local Prod | Cryptographic HMAC salt for Proof of Work bot shield | Generated via `crypto.randomBytes(24)` |
| `COOKIE_SECURE` | **Yes** | Vercel | Set to `"true"` to enforce HTTPS-only secure session cookies | Production standard config |

### 3. Domains & Public CDN Routing
| Variable | Required | Scope | Description & Production Example | Where to Obtain |
|:---|:---:|:---|:---|:---|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Vercel, Local Prod | `https://aalmvastralay.com` | Your live production marketplace domain |
| `NEXT_PUBLIC_B2_WORKER_URL` | **Yes** | Vercel, Local Prod | `https://media.aalmvastralay.com` (or `https://aalm-b2-proxy.<subdomain>.workers.dev`) | Deployed Cloudflare Worker endpoint |
| `NEXT_PUBLIC_USE_WSRV` | No | Vercel | `"true"` (enables fallback edge image optimization via wsrv.nl) | Default is `"true"` |

### 4. Backblaze B2 Object Storage (Server-Side Direct Uploads)
| Variable | Required | Scope | Description & Production Example | Where to Obtain |
|:---|:---:|:---|:---|:---|
| `B2_KEY_ID` | **Yes** | Vercel, CF Worker | `004e8b9a1c2d3e40000000001` | [Backblaze Console](https://secure.backblaze.com) -> Application Keys -> Add Key |
| `B2_APP_KEY` | **Yes** | Vercel, CF Worker | `K004xYz123456789AbCdEfGhIjKlMn` | Backblaze Application Key (copied upon creation) |
| `B2_BUCKET_ID` | **Yes** | Vercel | `4a5b6c7d8e9f0123456789ab` | Backblaze Console -> Buckets -> Bucket ID |
| `B2_BUCKET_NAME` | **Yes** | Vercel, CF Worker | `aalm-vastralay-media` | Backblaze Bucket Name |

### 5. Transactional Email Engine (Dual Hybrid: SMTP 500/day + GAS 100/day)
| Variable | Required | Scope | Description & Production Example | Where to Obtain |
|:---|:---:|:---|:---|:---|
| `SMTP_USER` | **Recommended** | Vercel, Local Prod | `your-store-email@gmail.com` (Gmail address for 500/day SMTP) | Your dedicated Gmail account |
| `SMTP_PASSWORD` | **Recommended** | Vercel, Local Prod | 16-character Google App Password (e.g. `abcd efgh ijkl mnop`) | [Google Account](https://myaccount.google.com/apppasswords) -> Security -> App passwords |
| `SMTP_HOST` | No | Vercel | `smtp.gmail.com` (Default) | Default SMTP host |
| `SMTP_PORT` | No | Vercel | `587` (Default TLS) or `465` (SSL) | Default SMTP port |
| `EMAIL_FROM` | No | Vercel | `"Your Store Name <your-store-email@gmail.com>"` | Sender display name & address |
| `GAS_WEBHOOK_URL` | **Yes** (Fallback) | Vercel, Local Prod | `https://script.google.com/macros/s/AKfycb.../exec` | [Google Apps Script](https://script.google.com) -> Deploy -> Web app URL |
| `GAS_SECRET_TOKEN` | **Yes** (Fallback) | Vercel, GAS Script | `your_gas_mail_shared_secret_token_here` | Matching secret in `Code.gs` and Next.js `.env` |

### 6. Super Admin & Database Initialization
| Variable | Required | Scope | Description & Production Example | Where to Obtain |
|:---|:---:|:---|:---|:---|
| `ADMIN_EMAIL` | **Yes** | Vercel | `admin@example.com` | Primary store owner administrator email |
| `ADMIN_PASSWORD` | **Yes** | Vercel | `YourStrongSecurePassword@2026` | Super admin login credential |
| `BOOTSTRAP_TOKEN` | **Yes** | Vercel | `your_one_time_bootstrap_token_here` | Authorization token for POST `/api/bootstrap` |
| `SKIP_SEED` | **Yes** | Vercel | Set to `"true"` in production to prevent inserting dummy demo products | Production configuration |

### 7. Optional Social Authentication (Google OAuth)
| Variable | Required | Scope | Description & Production Example | Where to Obtain |
|:---|:---:|:---|:---|:---|
| `GOOGLE_CLIENT_ID` | Optional | Vercel | `123456789012-abc.apps.googleusercontent.com` | [Google Cloud Console](https://console.cloud.google.com) -> Credentials |
| `GOOGLE_CLIENT_SECRET` | Optional | Vercel | `GOCSPX-xxxxxxxxxxxxxxxx` | Google Cloud Console -> OAuth Client Secret |

---

## 📄 Complete Production `.env.production` Template

```env
# ==============================================================================
# 👑 AALM VASTRALAY — PRODUCTION ENVIRONMENT CONFIGURATION
# ==============================================================================

# 1. DATABASE (Neon Serverless PostgreSQL - Mumbai Region with Pooler)
DATABASE_URL="postgresql://neondb_owner:YOUR_DATABASE_PASSWORD@ep-cool-flower-xxxxxx-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require"

# 2. SECURITY, CRYPTOGRAPHY & BOT DEFENSE
AUTH_SECRET="e9b2f4c781d0a5e38f12c67b94d183f05a76c82e91b45f3a7c2e81d094b72e15"
ENCRYPTION_SECRET="7a1f2b641a26c9a227fbf3d59a2a45dcb945eb98a6f4e2a34d14207f6415e6c6"
POW_SECRET="aalm_pow_shield_demo_secret_key_change_me_in_prod"
COOKIE_SECURE="true"

# 3. PUBLIC URLS & CDN MEDIA PROXY
NEXT_PUBLIC_SITE_URL="https://example-marketplace.vercel.app"
NEXT_PUBLIC_B2_WORKER_URL="https://media.example.com"
NEXT_PUBLIC_USE_WSRV="true"

# 4. BACKBLAZE B2 STORAGE (DIRECT CLIENT PRESIGNED UPLOADS)
B2_KEY_ID="004e8b9xxxxxxxx0000000001"
B2_APP_KEY="K004xxxxxxxxxxxxxxxxxxxxxxxxxxx"
B2_BUCKET_ID="4a5b6c7d8e9f0123456789ab"
B2_BUCKET_NAME="my-store-media-bucket"

# 5. DUAL HYBRID TRANSACTIONAL EMAIL ENGINE
# A. Primary: Direct Gmail SMTP (500 emails/day)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-store-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
EMAIL_FROM="Your Store Name <your-store-email@gmail.com>"

# B. Secondary: Google Apps Script Webhook Fallback (100 emails/day)
GAS_WEBHOOK_URL="https://script.google.com/macros/s/AKfycb_YOUR_APPS_SCRIPT_ID_HERE/exec"
GAS_SECRET_TOKEN="your_gas_mail_shared_secret_token_here"

# 6. SUPER ADMIN & DATABASE BOOTSTRAP
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="YourStrongSecurePassword@2026"
BOOTSTRAP_TOKEN="your_one_time_bootstrap_token_here"
SKIP_SEED="true"

# 7. OPTIONAL GOOGLE OAUTH
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 🔒 Secret Rotation & Zero-Leak Protocol

1. **Never commit `.env`, `.env.local`, or `.env.production` into git:** Verified in `.gitignore`.
2. **Rotating Compromised Keys:**
   - **`AUTH_SECRET`:** Rotate in Vercel settings -> redeploy -> all active sessions are logged out cleanly.
   - **`B2_APP_KEY`:** Generate a new key in Backblaze -> update Vercel and Cloudflare secrets (`npx wrangler secret put B2_APP_KEY`) -> revoke old key.
   - **`GAS_SECRET_TOKEN`:** Update `GAS_SECRET_TOKEN` in `Code.gs` and re-deploy -> update Vercel environment variables.
