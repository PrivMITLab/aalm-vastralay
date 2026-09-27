#!/usr/bin/env pwsh
<#
.SYNOPSIS
    👑 Aalm Vastralay — Backblaze B2 + Cloudflare Worker Auto-Setup Script (Windows)
    Location: scripts/setup-b2-worker.ps1

.DESCRIPTION
    Ek command mein sab kuch set ho jaata hai:
      ✅ Cloudflare login check
      ✅ KV Namespace auto-create (agar nahi hai to)
      ✅ wrangler-b2-proxy.toml auto-update (KV ID + account_id)
      ✅ B2_KEY_ID aur B2_APP_KEY securely set (never stored in files)
      ✅ Worker deploy
      ✅ .env.local update with Worker URL

.USAGE
    pwsh scripts/setup-b2-worker.ps1
    
    Agar already setup hai aur sirf redeploy karna hai:
    pwsh scripts/setup-b2-worker.ps1 -SkipSecrets
    
    Agar sirf secrets update karni hain:
    pwsh scripts/setup-b2-worker.ps1 -OnlySecrets

.NOTES
    - Koi bhi credential file mein save nahi hoti
    - B2 keys sirf Cloudflare encrypted secrets mein jaati hain
    - account_id aur KV ID sensitive nahi hain (public identifiers)
#>

param(
    [switch]$SkipSecrets,
    [switch]$OnlySecrets
)

# ─────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────

function Write-Step { param([string]$Msg) Write-Host "`n🔹 $Msg" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Msg) Write-Host "   ✅ $Msg" -ForegroundColor Green }
function Write-Warn { param([string]$Msg) Write-Host "   ⚠️  $Msg" -ForegroundColor Yellow }
function Write-Fail { param([string]$Msg) Write-Host "   ❌ $Msg" -ForegroundColor Red; exit 1 }
function Write-Info { param([string]$Msg) Write-Host "   ℹ️  $Msg" -ForegroundColor DarkGray }

$ErrorActionPreference = "Stop"
$TOML_PATH = "cloudflare-worker/wrangler-b2-proxy.toml"
$WORKER_DIR = "cloudflare-worker"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  👑 Aalm Vastralay — B2 + Cloudflare Worker Setup   ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ─────────────────────────────────────────────
# STEP 1: Check wrangler is available
# ─────────────────────────────────────────────
Write-Step "Checking Wrangler CLI..."
try {
    $wranglerVersion = (npx wrangler --version 2>&1) | Select-String "wrangler" | Select-Object -First 1
    Write-Ok "Wrangler found: $wranglerVersion"
} catch {
    Write-Fail "Wrangler not found. Run: npm install -g wrangler"
}

# ─────────────────────────────────────────────
# STEP 2: Check Cloudflare login
# ─────────────────────────────────────────────
Write-Step "Checking Cloudflare login..."
$whoamiOutput = npx wrangler whoami --config $TOML_PATH 2>&1 | Out-String
if ($whoamiOutput -notmatch "logged in") {
    Write-Warn "Not logged in. Opening Cloudflare login in browser..."
    npx wrangler login
    Start-Sleep -Seconds 3
    $whoamiOutput = npx wrangler whoami --config $TOML_PATH 2>&1 | Out-String
}

# Parse email and account ID from whoami output
$emailMatch   = [regex]::Match($whoamiOutput, 'email\s+(\S+@\S+)')
$accountMatch = [regex]::Match($whoamiOutput, '│\s+(\S+@\S+).*?│\s+([0-9a-f]{32})\s+│')
$accountId    = ""
if ($accountMatch.Success) {
    $accountId = $accountMatch.Groups[2].Value.Trim()
    Write-Ok "Logged in | Account ID: $accountId"
} else {
    # Fallback: parse table differently
    $lines = $whoamiOutput -split "`n"
    foreach ($line in $lines) {
        if ($line -match '[0-9a-f]{32}') {
            $accountId = ([regex]::Match($line, '[0-9a-f]{32}')).Value
            break
        }
    }
    if ($accountId) {
        Write-Ok "Logged in | Account ID: $accountId"
    } else {
        Write-Fail "Could not parse account ID from wrangler whoami. Please run: npx wrangler login"
    }
}

if ($OnlySecrets) {
    # Jump straight to secrets
    goto_secrets
}

# ─────────────────────────────────────────────
# STEP 3: Check/Create KV Namespace
# ─────────────────────────────────────────────
Write-Step "Checking KV Namespace (B2_TOKEN_KV)..."
$kvListJson = npx wrangler kv namespace list --config $TOML_PATH 2>&1 | Select-String "^\[" -Context 0,1000 | Select-Object -First 1
$kvListRaw  = npx wrangler kv namespace list --config $TOML_PATH 2>&1 | Out-String

# Try to parse KV namespace ID from JSON output
$kvId = ""
$kvMatches = [regex]::Matches($kvListRaw, '"id"\s*:\s*"([0-9a-f]{32})"')
$kvTitleMatches = [regex]::Matches($kvListRaw, '"title"\s*:\s*"([^"]+)"')
for ($i = 0; $i -lt $kvTitleMatches.Count; $i++) {
    $title = $kvTitleMatches[$i].Groups[1].Value
    if ($title -like "*B2_TOKEN_KV*" -or $title -eq "B2_TOKEN_KV") {
        if ($i -lt $kvMatches.Count) {
            $kvId = $kvMatches[$i].Groups[1].Value
            Write-Ok "Found existing KV namespace: $kvId"
            break
        }
    }
}

if (-not $kvId) {
    Write-Info "KV namespace not found. Creating..."
    $createOutput = npx wrangler kv namespace create B2_TOKEN_KV --config $TOML_PATH 2>&1 | Out-String
    $kvIdMatch = [regex]::Match($createOutput, 'id\s*=\s*"([0-9a-f]{32})"')
    if ($kvIdMatch.Success) {
        $kvId = $kvIdMatch.Groups[1].Value
        Write-Ok "KV Namespace created: $kvId"
    } else {
        Write-Fail "Could not create KV namespace. Output was:`n$createOutput"
    }
}

# ─────────────────────────────────────────────
# STEP 4: Update wrangler-b2-proxy.toml safely
# ─────────────────────────────────────────────
Write-Step "Updating wrangler-b2-proxy.toml with account_id and KV id..."

$tomlContent = Get-Content $TOML_PATH -Raw

# Update or add account_id
if ($tomlContent -match 'account_id\s*=\s*"[^"]*"') {
    $tomlContent = $tomlContent -replace 'account_id\s*=\s*"[^"]*"', "account_id = `"$accountId`""
} else {
    $tomlContent = $tomlContent -replace '(name\s*=\s*"[^"]*"\s*\n)', "`$1account_id = `"$accountId`"`n"
}

# Update KV namespace id
$tomlContent = $tomlContent -replace 'id\s*=\s*"[^"]*"', "id = `"$kvId`""

Set-Content $TOML_PATH $tomlContent -NoNewline -Encoding UTF8
Write-Ok "wrangler-b2-proxy.toml updated (account_id + KV id)"
Write-Info "Note: These are non-secret identifiers — safe to commit"

# ─────────────────────────────────────────────
# STEP 5: Set B2 Secrets (Securely)
# ─────────────────────────────────────────────
:goto_secrets
if (-not $SkipSecrets) {
    Write-Step "Setting Backblaze B2 Secrets..."
    Write-Host ""
    Write-Host "   Backblaze B2 Console -> App Keys se lein:" -ForegroundColor White
    Write-Host "   https://secure.backblaze.com/app_keys.htm" -ForegroundColor DarkCyan
    Write-Host ""

    # B2_KEY_ID
    $b2KeyId = Read-Host "   Enter B2_KEY_ID (keyID from Backblaze)"
    if ([string]::IsNullOrWhiteSpace($b2KeyId)) {
        Write-Warn "B2_KEY_ID skipped. Set manually later: npx wrangler secret put B2_KEY_ID --config $TOML_PATH"
    } else {
        $b2KeyId | npx wrangler secret put B2_KEY_ID --config $TOML_PATH
        Write-Ok "B2_KEY_ID stored securely in Cloudflare"
    }

    # B2_APP_KEY
    $b2AppKey = Read-Host "   Enter B2_APP_KEY (applicationKey from Backblaze)"
    if ([string]::IsNullOrWhiteSpace($b2AppKey)) {
        Write-Warn "B2_APP_KEY skipped. Set manually later: npx wrangler secret put B2_APP_KEY --config $TOML_PATH"
    } else {
        $b2AppKey | npx wrangler secret put B2_APP_KEY --config $TOML_PATH
        Write-Ok "B2_APP_KEY stored securely in Cloudflare"
    }

    Write-Info "Secrets kisi bhi file mein save nahi hain — sirf Cloudflare encrypted vault mein hain"
}

# ─────────────────────────────────────────────
# STEP 6: Deploy Worker
# ─────────────────────────────────────────────
Write-Step "Deploying Cloudflare Worker..."
$deployOutput = npx wrangler deploy --config $TOML_PATH 2>&1 | Out-String
Write-Host $deployOutput

$workerUrlMatch = [regex]::Match($deployOutput, 'https://[a-z0-9\-]+\.workers\.dev')
$workerUrl = ""
if ($workerUrlMatch.Success) {
    $workerUrl = $workerUrlMatch.Value
    Write-Ok "Worker deployed: $workerUrl"
} else {
    Write-Warn "Could not auto-detect worker URL from output. Check Cloudflare Dashboard."
}

# ─────────────────────────────────────────────
# STEP 7: Update .env.local
# ─────────────────────────────────────────────
if ($workerUrl) {
    Write-Step "Updating .env.local with NEXT_PUBLIC_B2_WORKER_URL..."
    $envPath = ".env.local"
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath -Raw
        if ($envContent -match "NEXT_PUBLIC_B2_WORKER_URL") {
            $envContent = $envContent -replace 'NEXT_PUBLIC_B2_WORKER_URL=.*', "NEXT_PUBLIC_B2_WORKER_URL=`"$workerUrl`""
            Set-Content $envPath $envContent -NoNewline -Encoding UTF8
        } else {
            Add-Content $envPath "`nNEXT_PUBLIC_B2_WORKER_URL=`"$workerUrl`""
        }
        Write-Ok ".env.local updated"
    } else {
        Write-Info ".env.local not found — creating with worker URL..."
        Set-Content $envPath "NEXT_PUBLIC_B2_WORKER_URL=`"$workerUrl`"" -Encoding UTF8
        Write-Ok ".env.local created"
    }
}

# ─────────────────────────────────────────────
# STEP 8: Final Summary
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            ✅ Setup Complete!                        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
if ($workerUrl) {
    Write-Host "  🌐 Worker URL  : $workerUrl" -ForegroundColor Cyan
}
Write-Host "  📦 KV Namespace: $kvId" -ForegroundColor DarkGray
Write-Host "  🔑 Account ID  : $accountId" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  ⚡ Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Vercel Dashboard → Settings → Environment Variables mein set karein:"
if ($workerUrl) {
    Write-Host "     NEXT_PUBLIC_B2_WORKER_URL = $workerUrl" -ForegroundColor Cyan
}
Write-Host "  2. Backblaze B2 mein bucket banaaen: aalm-vastralay-media (Private)"
Write-Host "  3. Test: Invoke-WebRequest '$workerUrl/test.txt'"
Write-Host ""
Write-Host "  📖 Full guide: docs/b2-cloudflare-setup.md" -ForegroundColor DarkGray
Write-Host ""
