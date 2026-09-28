#!/usr/bin/env pwsh
<#
.SYNOPSIS
    👑 Aalm Vastralay — Master Interactive Environment & Vercel CLI Setup Wizard
    Location: scripts/setup-env.ps1

.DESCRIPTION
    Interactively guides you through configuring:
      1. Neon Serverless PostgreSQL (DATABASE_URL)
      2. Security & Auth Secrets (AUTH_SECRET, ENCRYPTION_SECRET, POW_SECRET)
      3. Backblaze B2 Cold Storage + Cloudflare Worker Proxy
      4. Free AI Integrations (Google Gemini 2.5 Flash + Groq Llama 3.3)
      5. Optional 1-Click Sync to Vercel Cloud (via Vercel CLI)

.USAGE
    pwsh scripts/setup-env.ps1
    or
    npm run setup:env
#>

param(
    [switch]$SkipVercel,
    [switch]$NonInteractive
)

$ErrorActionPreference = "Continue"

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║  👑 Aalm Vastralay — $Title" -ForegroundColor Magenta
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

function Write-Step { param([string]$Msg) Write-Host "`n🔹 $Msg" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Msg) Write-Host "   ✅ $Msg" -ForegroundColor Green }
function Write-Warn { param([string]$Msg) Write-Host "   ⚠️  $Msg" -ForegroundColor Yellow }
function Write-Info { param([string]$Msg) Write-Host "   ℹ️  $Msg" -ForegroundColor DarkGray }

function Generate-CryptoHex {
    param([int]$Bytes = 32)
    $buffer = New-Object byte[] $Bytes
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buffer)
    return [System.BitConverter]::ToString($buffer).Replace("-", "").ToLower()
}

Write-Header "Master Environment & Cloud Deployment Wizard"

# ─────────────────────────────────────────────
# Read Existing .env.local if present
# ─────────────────────────────────────────────
$EnvFilePath = ".env.local"
$ExistingEnvs = @{}

if (Test-Path $EnvFilePath) {
    Write-Info "Found existing .env.local. Loading current values as defaults..."
    Get-Content $EnvFilePath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $val = $parts[1].Trim().Trim('"').Trim("'")
            $ExistingEnvs[$key] = $val
        }
    }
}

# ─────────────────────────────────────────────
# 1. DATABASE (Neon PostgreSQL)
# ─────────────────────────────────────────────
Write-Step "1/5: Database Configuration (Neon PostgreSQL)"
Write-Info "Get connection string from: https://console.neon.tech"
Write-Info "Dashboard -> Your Project -> Connection Details -> Pooled connection"

$defaultDb = $ExistingEnvs["DATABASE_URL"]
if (-not $defaultDb) { $defaultDb = "postgresql://user:password@ep-xyz-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require" }

Write-Host "   Enter DATABASE_URL [$defaultDb]: " -NoNewline -ForegroundColor Yellow
$inputDb = Read-Host
$dbUrl = if ($inputDb.Trim()) { $inputDb.Trim() } else { $defaultDb }
Write-Ok "DATABASE_URL configured"

# ─────────────────────────────────────────────
# 2. CORE SECURITY SECRETS
# ─────────────────────────────────────────────
Write-Step "2/5: Core Security & Authentication Secrets"
$defaultAuth = $ExistingEnvs["AUTH_SECRET"]
if (-not $defaultAuth) { $defaultAuth = Generate-CryptoHex 32 }

$defaultEnc = $ExistingEnvs["ENCRYPTION_SECRET"]
if (-not $defaultEnc) { $defaultEnc = Generate-CryptoHex 32 }

$defaultPow = $ExistingEnvs["POW_SECRET"]
if (-not $defaultPow) { $defaultPow = "aalm_shield_" + (Generate-CryptoHex 16) }

Write-Host "   Use auto-generated 64-char crypto secrets? (Y/n) [Y]: " -NoNewline -ForegroundColor Yellow
$useAutoSecrets = Read-Host
if ($useAutoSecrets.Trim().ToLower() -eq "n") {
    Write-Host "   Enter AUTH_SECRET: " -NoNewline
    $inputAuth = Read-Host
    if ($inputAuth.Trim()) { $defaultAuth = $inputAuth.Trim() }

    Write-Host "   Enter ENCRYPTION_SECRET: " -NoNewline
    $inputEnc = Read-Host
    if ($inputEnc.Trim()) { $defaultEnc = $inputEnc.Trim() }
}
Write-Ok "Cryptographic auth & encryption secrets set"

# ─────────────────────────────────────────────
# 3. BACKBLAZE B2 & CLOUDFLARE WORKER
# ─────────────────────────────────────────────
Write-Step "3/5: Cold Media Storage (Backblaze B2 + Cloudflare Worker)"
Write-Info "Backblaze B2 Console: https://secure.backblaze.com/app_keys.htm"

$defaultB2Worker = $ExistingEnvs["NEXT_PUBLIC_B2_WORKER_URL"]
if (-not $defaultB2Worker) { $defaultB2Worker = "https://aalm-b2-proxy.alamwastraly.workers.dev" }
Write-Host "   Enter Cloudflare B2 Worker URL [$defaultB2Worker]: " -NoNewline -ForegroundColor Yellow
$inputWorker = Read-Host
$b2WorkerUrl = if ($inputWorker.Trim()) { $inputWorker.Trim() } else { $defaultB2Worker }

$defaultB2Bucket = $ExistingEnvs["B2_BUCKET_NAME"]
if (-not $defaultB2Bucket) { $defaultB2Bucket = "aalm-vastralay-media" }
Write-Host "   Enter B2 Bucket Name [$defaultB2Bucket]: " -NoNewline -ForegroundColor Yellow
$inputBucket = Read-Host
$b2BucketName = if ($inputBucket.Trim()) { $inputBucket.Trim() } else { $defaultB2Bucket }

$defaultB2KeyId = $ExistingEnvs["B2_KEY_ID"]
Write-Host "   Enter B2 Key ID (keyID) [$defaultB2KeyId]: " -NoNewline -ForegroundColor Yellow
$inputKeyId = Read-Host
$b2KeyId = if ($inputKeyId.Trim()) { $inputKeyId.Trim() } else { $defaultB2KeyId }

$defaultB2AppKey = $ExistingEnvs["B2_APPLICATION_KEY"]
if (-not $defaultB2AppKey) { $defaultB2AppKey = $ExistingEnvs["B2_APP_KEY"] }
Write-Host "   Enter B2 Application Key (applicationKey) [masked]: " -NoNewline -ForegroundColor Yellow
$inputAppKey = Read-Host -AsSecureString
$b2AppKey = if ($inputAppKey) { [System.Net.NetworkCredential]::new("", $inputAppKey).Password } else { $defaultB2AppKey }

$defaultB2BucketId = $ExistingEnvs["B2_BUCKET_ID"]
Write-Host "   Enter B2 Bucket ID (Optional, for direct API) [$defaultB2BucketId]: " -NoNewline -ForegroundColor Yellow
$inputBucketId = Read-Host
$b2BucketId = if ($inputBucketId.Trim()) { $inputBucketId.Trim() } else { $defaultB2BucketId }

Write-Ok "Backblaze B2 & Cloudflare Worker proxy configured"

# ─────────────────────────────────────────────
# 4. FREE AI SERVICES (Gemini + Groq)
# ─────────────────────────────────────────────
Write-Step "4/5: Free AI Services (Google Gemini 2.5 Flash + Groq Llama 3.3)"
Write-Info "Gemini Key (Free 15 RPM): https://aistudio.google.com/app/apikey"
Write-Info "Groq Key (Free 30 RPM):   https://console.groq.com/keys"

$defaultGemini = $ExistingEnvs["GEMINI_API_KEY"]
Write-Host "   Enter Google Gemini API Key [$defaultGemini]: " -NoNewline -ForegroundColor Yellow
$inputGemini = Read-Host
$geminiKey = if ($inputGemini.Trim()) { $inputGemini.Trim() } else { $defaultGemini }

$defaultGroq = $ExistingEnvs["GROQ_API_KEY"]
Write-Host "   Enter Groq Cloud API Key [$defaultGroq]: " -NoNewline -ForegroundColor Yellow
$inputGroq = Read-Host
$groqKey = if ($inputGroq.Trim()) { $inputGroq.Trim() } else { $defaultGroq }

Write-Ok "AI API keys configured"

# ─────────────────────────────────────────────
# Assemble and Write .env.local
# ─────────────────────────────────────────────
Write-Step "Writing .env.local configuration file..."

$envContent = @"
# ==============================================================================
# 👑 AALM VASTRALAY (आलम वस्त्रालय) — LOCAL & PRODUCTION ENVIRONMENT CONFIG
# Generated via scripts/setup-env.ps1 on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ==============================================================================

# 1. Database (Neon Serverless PostgreSQL)
DATABASE_URL="$dbUrl"
ALLOW_DIRECT_DB="true"

# 2. Core Security & Authentication Secrets
AUTH_SECRET="$defaultAuth"
ENCRYPTION_SECRET="$defaultEnc"
POW_SECRET="$defaultPow"

# 3. Server URL & Network
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
COOKIE_SECURE="false"
TRUST_PROXY="true"
NEXT_PUBLIC_USE_WSRV="true"

# 4. Cold Media Storage (Backblaze B2 + Cloudflare CDN)
NEXT_PUBLIC_B2_WORKER_URL="$b2WorkerUrl"
B2_BUCKET_NAME="$b2BucketName"
B2_KEY_ID="$b2KeyId"
B2_APPLICATION_KEY="$b2AppKey"
B2_APP_KEY="$b2AppKey"
B2_BUCKET_ID="$b2BucketId"

# 5. Free AI Services
GEMINI_API_KEY="$geminiKey"
GROQ_API_KEY="$groqKey"

# 6. Admin First Boot
ADMIN_EMAIL="admin@aalmvastralay.com"
ADMIN_PASSWORD="Admin@123"
BOOTSTRAP_TOKEN="aalm_boot_$(Generate-CryptoHex 16)"
SKIP_SEED="false"

# 7. Store Branding & UPI Defaults
NEXT_PUBLIC_APP_NAME="Aalm Vastralay"
NEXT_PUBLIC_BRAND_TAGLINE="Royal Indian Wedding & Luxury Ethnic Wear"
NEXT_PUBLIC_UPI_VPA="testmerchant@upi"
NEXT_PUBLIC_UPI_PAYEE_NAME="Aalm Vastralay Store"
"@

Set-Content -Path $EnvFilePath -Value $envContent -Encoding UTF8
Write-Ok ".env.local successfully saved!"

# ─────────────────────────────────────────────
# 5. VERCEL CLI 1-CLICK SYNC
# ─────────────────────────────────────────────
if (-not $SkipVercel) {
    Write-Step "5/5: Vercel Cloud CLI Sync (Optional 1-Click Deploy)"
    Write-Host "   Do you want to sync these variables directly to your Vercel Project? (Y/n) [Y]: " -NoNewline -ForegroundColor Yellow
    $syncVercel = Read-Host
    if ($syncVercel.Trim().ToLower() -ne "n") {
        Write-Info "Checking Vercel CLI..."
        $vercelCheck = npx --yes vercel --version 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Vercel CLI not available. Run: npm install -g vercel"
        } else {
            Write-Ok "Vercel CLI ready ($($vercelCheck.Trim()))"

            # Check Login
            Write-Info "Checking Vercel login status..."
            $whoami = npx vercel whoami 2>&1 | Out-String
            if ($whoami -match "Error" -or $whoami -match "not logged in") {
                Write-Warn "Not logged in to Vercel. Opening login..."
                npx vercel login
            } else {
                Write-Ok "Logged in as: $($whoami.Trim())"
            }

            # Check Link
            if (-not (Test-Path ".vercel")) {
                Write-Warn "Project not linked to Vercel yet. Linking project now..."
                npx vercel link
            }

            # Sync Keys
            Write-Step "Syncing Environment Variables to Vercel Production & Preview..."
            $varsToSync = @{
                "DATABASE_URL"              = $dbUrl
                "AUTH_SECRET"               = $defaultAuth
                "ENCRYPTION_SECRET"         = $defaultEnc
                "POW_SECRET"                = $defaultPow
                "NEXT_PUBLIC_B2_WORKER_URL" = $b2WorkerUrl
                "B2_BUCKET_NAME"            = $b2BucketName
                "B2_KEY_ID"                 = $b2KeyId
                "B2_APPLICATION_KEY"        = $b2AppKey
                "B2_APP_KEY"                = $b2AppKey
                "B2_BUCKET_ID"              = $b2BucketId
                "GEMINI_API_KEY"            = $geminiKey
                "GROQ_API_KEY"              = $groqKey
            }

            foreach ($kv in $varsToSync.GetEnumerator()) {
                if ($kv.Value) {
                    Write-Host "   Pushing $($kv.Key)..." -NoNewline -ForegroundColor DarkGray
                    # Add to production and preview
                    $valClean = $kv.Value
                    echo $valClean | npx vercel env add $kv.Key production --force 2>$null | Out-Null
                    echo $valClean | npx vercel env add $kv.Key preview --force 2>$null | Out-Null
                    Write-Host " [OK]" -ForegroundColor Green
                }
            }
            Write-Ok "All production & preview environment variables pushed to Vercel!"
        }
    }
}

Write-Host ""
Write-Host "🎉 ALL SET! You can now start local development with:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
