# 🛠️ AALM VASTRALAY — LOCAL & CLOUD SETUP GUIDE
# Location: docs/SETUP.md

## 1. Prerequisites
- **Node.js:** v20.x or higher (`node -v`)
- **Package Manager:** npm v10.x or higher
- **Database:** Free PostgreSQL database on [Neon.tech](https://neon.tech)

## 2. Quick Start Steps

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/alamwastraly-sketch/aalm-vastralay.git
cd aalm-vastralay
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` is set to your Neon Postgres connection string:
```env
DATABASE_URL="postgresql://neondb_owner:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
ENCRYPTION_KEY="your-32-byte-secret-hex-key"
ADMIN_EMAIL="admin@aalmvastralay.com"
ADMIN_PASSWORD="Admin@123"
```

### Step 3: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The base schema, 18 ethnic categories, default coupon, and super-admin account are automatically provisioned!

### Step 4: Run Enterprise Verification Tests
```bash
npm test
npm run typecheck
npm run lint
```
