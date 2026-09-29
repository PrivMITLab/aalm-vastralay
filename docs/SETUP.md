# 🛠️ AALM VASTRALAY — COMPLETE SETUP & RUN GUIDE
# Location: docs/SETUP.md

This guide explains how to install, configure, and run **Aalm Vastralay (आलम वस्त्रालय)** across both **Local Development** and **Live Production** environments.

> 📖 **Specialized Production Manuals:**
> - 🐘 Database Engine: [**docs/NEON_POSTGRESQL.md**](NEON_POSTGRESQL.md)
> - ⚡ Frontend & Compute: [**docs/VERCEL_DEPLOYMENT.md**](VERCEL_DEPLOYMENT.md)
> - 🛡️ Edge Proxy & CDN: [**docs/CLOUDFLARE_WORKER.md**](CLOUDFLARE_WORKER.md)
> - 📦 Cold Storage: [**docs/BACKBLAZE_B2.md**](BACKBLAZE_B2.md)
> - 📧 Transactional Mailer: [**docs/GAS_MAILER.md**](GAS_MAILER.md)
> - 🔐 Environment & Secrets: [**docs/ENV_VARS_PRODUCTION.md**](ENV_VARS_PRODUCTION.md)

---

## 📑 Quick Navigation

- [1. System Prerequisites](#1-system-prerequisites)
- [2. Local Development Setup (Quick Start)](#2-local-development-setup-quick-start)
- [3. Production Deployment Setup](#3-production-deployment-setup)
- [4. Verification & Testing Commands](#4-verification--testing-commands)
- [5. Database Migration & Seeding](#5-database-migration--seeding)
- [6. Frequently Asked Questions & Troubleshooting](#6-frequently-asked-questions--troubleshooting)

---

## 1. System Prerequisites

Ensure you have the following installed on your machine:

- **Node.js:** `v20.x` or higher (`node -v`)
- **Package Manager:** `npm v10.x` or higher (`npm -v`)
- **Git:** Latest version
- **Database:** Free PostgreSQL database instance on [Neon.tech](https://neon.tech) (Mumbai region `ap-south-1` recommended for India).

---

## 2. Local Development Setup (Quick Start)

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-org/aalm-vastralay.git
cd aalm-vastralay
npm install
```
> **Note:** `npm install` automatically initializes Husky Git hooks. Every commit is pre-verified (`tsc --noEmit` and `eslint .`) and validated against Conventional Commits (`commitlint`).

### Step 2: Configure Environment Variables (Interactive Wizard or Manual)

**Option A: 1-Command Interactive Setup Wizard (Recommended)**
```bash
npm run setup:env
```
*(This PowerShell wizard steps through configuring Neon PostgreSQL, generating cryptographic secrets, Backblaze B2 storage, and Google Gemini / Groq AI keys, with an optional 1-click sync to Vercel!)*

**Option B: Manual Configuration**
Copy the dedicated local development template to `.env.local`:
```bash
cp .env.development.example .env.local
```

Open `.env.local` and add your Neon PostgreSQL connection string:
```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require"
```
*(All security keys in `.env.development.example` have working local development fallbacks pre-filled!)*

### Step 3: Run the Development Server
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.
The platform automatically auto-provisions:
- All database tables & indexes.
- Default Indian ethnic categories (Women, Men, Kids, Accessories).
- Official super-admin account (`admin@aalmvastralay.com` / `Admin@123`).
- Default WELCOME10 coupon.

---

## 3. Production Deployment Setup

### Step 1: Prepare Neon Database
1. Go to [Neon Console](https://console.neon.tech).
2. Create project `aalm-vastralay` in region **Mumbai (`ap-south-1`)**.
3. Under **Connection Details**, ensure **Pooled connection** is selected (`-pooler` in host).

### Step 2: Set Environment Variables in Vercel
In your Vercel Project Dashboard (**Settings -> Environment Variables**), add the variables from [`.env.production.example`](../.env.production.example):

| Variable Name | Purpose | Value Example / Generation |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Pooled Connection String | `postgresql://neondb_owner:...@ep-...-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | Session Signing Secret | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ENCRYPTION_SECRET`| AES-256-GCM Secret | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `POW_SECRET` | Bot Shield Salt | Any secure random string (e.g. `aalm_pow_salt_2026`) |
| `NEXT_PUBLIC_SITE_URL`| Production URL | `https://aalm-vastralay.vercel.app` |

*(Refer to [`docs/SECRETS_AND_CONFIGURATION_MATRIX.md`](SECRETS_AND_CONFIGURATION_MATRIX.md) for optional variables like GAS Mailer, UPI VPA, and Backblaze B2).*

### Step 3: Deploy & Bootstrap
After Vercel completes deployment:
```powershell
Invoke-RestMethod -Method Post -Uri "https://aalm-vastralay.vercel.app/api/bootstrap?token=aalm_boot_9f7c2b4e8a1d6e3f5a0c7b9e2d4f6a8c"
```
Or simply visit `https://aalm-vastralay.vercel.app/admin` and log in with your super admin credentials!

---

## 4. Verification & Testing Commands

Before pushing any changes, always run the full verification matrix:

```bash
# 1. Run all 38 automated enterprise test suites
npm test

# 2. Strict TypeScript typechecking (0 errors, 0 any types)
npm run typecheck

# 3. Code quality and formatting lint
npm run lint

# 4. Production build verification (SWC + bundler checks)
npm run build
```

---

## 5. Database Migration & Seeding

The platform operates on a **Zero Data Loss Migration Contract**. To run migrations or seeds manually:

```bash
# Safely create missing tables & add new columns without dropping data
npm run db:auto-migrate

# Provision clean base data (categories, default coupons, super admin)
npm run db:seed
```

---

## 6. Frequently Asked Questions & Troubleshooting

### Q1: Why does `api/bootstrap` return error `28P01`?
- **Answer:** Code `28P01` means `password authentication failed for user 'neondb_owner'`. Ensure you copied the fresh password from your Neon console and updated `DATABASE_URL` in Vercel settings.

### Q2: Why is the pooled connection string mandatory in production?
- **Answer:** Serverless platforms like Vercel spin up dozens of isolated compute instances on traffic spikes. Neon's connection pooler (`-pooler`) manages connection reuse and prevents PostgreSQL connection exhaustion.

### Q3: Where are the default admin credentials defined?
- **Answer:** In `src/db/init.ts` (default: `admin@aalmvastralay.com` / `Admin@123`), customizable via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment variables.
