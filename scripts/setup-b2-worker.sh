#!/usr/bin/env bash
# ==============================================================================
# 👑 Aalm Vastralay — Backblaze B2 + Cloudflare Worker Auto-Setup Script
# Location: scripts/setup-b2-worker.sh
#
# Usage:
#   bash scripts/setup-b2-worker.sh            # Full setup
#   bash scripts/setup-b2-worker.sh --skip-secrets   # Redeploy only
#   bash scripts/setup-b2-worker.sh --only-secrets   # Update B2 keys only
# ==============================================================================
set -euo pipefail

SKIP_SECRETS=false
ONLY_SECRETS=false
for arg in "$@"; do
  case $arg in
    --skip-secrets) SKIP_SECRETS=true ;;
    --only-secrets) ONLY_SECRETS=true ;;
  esac
done

TOML_PATH="cloudflare-worker/wrangler-b2-proxy.toml"
WORKER_URL=""
ACCOUNT_ID=""
KV_ID=""

# ─────────────────────────────────────────────
# Colors
# ─────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; GRAY='\033[0;90m'; NC='\033[0m'

step()  { echo -e "\n${CYAN}🔹 $1${NC}"; }
ok()    { echo -e "   ${GREEN}✅ $1${NC}"; }
warn()  { echo -e "   ${YELLOW}⚠️  $1${NC}"; }
fail()  { echo -e "   ${RED}❌ $1${NC}"; exit 1; }
info()  { echo -e "   ${GRAY}ℹ️  $1${NC}"; }

echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  👑 Aalm Vastralay — B2 + Cloudflare Worker Setup   ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────────
# STEP 1: Check wrangler
# ─────────────────────────────────────────────
step "Checking Wrangler CLI..."
if ! command -v npx &> /dev/null; then
  fail "npx not found. Install Node.js from https://nodejs.org"
fi
WRANGLER_VER=$(npx wrangler --version 2>&1 | grep -o 'wrangler [0-9.]*' | head -1)
ok "Wrangler found: $WRANGLER_VER"

# ─────────────────────────────────────────────
# STEP 2: Check login
# ─────────────────────────────────────────────
step "Checking Cloudflare login..."
WHOAMI=$(npx wrangler whoami --config "$TOML_PATH" 2>&1 || true)
if echo "$WHOAMI" | grep -q "logged in"; then
  ACCOUNT_ID=$(echo "$WHOAMI" | grep -oE '[0-9a-f]{32}' | head -1)
  ok "Logged in | Account ID: $ACCOUNT_ID"
else
  warn "Not logged in. Opening Cloudflare login..."
  npx wrangler login
  sleep 3
  WHOAMI=$(npx wrangler whoami --config "$TOML_PATH" 2>&1)
  ACCOUNT_ID=$(echo "$WHOAMI" | grep -oE '[0-9a-f]{32}' | head -1)
  if [ -z "$ACCOUNT_ID" ]; then
    fail "Login failed. Please run: npx wrangler login"
  fi
  ok "Logged in | Account ID: $ACCOUNT_ID"
fi

[ "$ONLY_SECRETS" = true ] && { set_secrets; finalize; exit 0; }

# ─────────────────────────────────────────────
# STEP 3: Check/Create KV Namespace
# ─────────────────────────────────────────────
step "Checking KV Namespace (B2_TOKEN_KV)..."
KV_LIST=$(npx wrangler kv namespace list --config "$TOML_PATH" 2>&1 || true)
KV_ID=$(echo "$KV_LIST" | python3 -c "
import sys, json, re
try:
    data = json.load(sys.stdin)
    for ns in data:
        if 'B2_TOKEN_KV' in ns.get('title',''):
            print(ns.get('id',''))
            break
except:
    pass
" 2>/dev/null || true)

if [ -z "$KV_ID" ]; then
  info "KV namespace not found. Creating..."
  CREATE_OUT=$(npx wrangler kv namespace create B2_TOKEN_KV --config "$TOML_PATH" 2>&1)
  KV_ID=$(echo "$CREATE_OUT" | grep -oE 'id = "[0-9a-f]+"' | grep -oE '[0-9a-f]{32}')
  if [ -z "$KV_ID" ]; then
    fail "KV namespace creation failed:\n$CREATE_OUT"
  fi
  ok "KV Namespace created: $KV_ID"
else
  ok "Found existing KV namespace: $KV_ID"
fi

# ─────────────────────────────────────────────
# STEP 4: Update wrangler-b2-proxy.toml
# ─────────────────────────────────────────────
step "Updating wrangler-b2-proxy.toml..."

# Update or insert account_id
if grep -q 'account_id' "$TOML_PATH"; then
  sed -i.bak "s|account_id = \".*\"|account_id = \"$ACCOUNT_ID\"|" "$TOML_PATH"
else
  sed -i.bak "s|^\(name = \"[^\"]*\"\)|\1\naccount_id = \"$ACCOUNT_ID\"|" "$TOML_PATH"
fi

# Update KV id
sed -i.bak "s|id = \".*\"|id = \"$KV_ID\"|" "$TOML_PATH"
rm -f "${TOML_PATH}.bak"

ok "wrangler-b2-proxy.toml updated"
info "account_id + KV id are non-secret identifiers — safe to commit"

# ─────────────────────────────────────────────
# STEP 5: Set B2 Secrets
# ─────────────────────────────────────────────
set_secrets() {
  if [ "$SKIP_SECRETS" = false ]; then
    step "Setting Backblaze B2 Secrets..."
    echo ""
    echo "   Backblaze B2 Console → App Keys:"
    echo -e "   ${CYAN}https://secure.backblaze.com/app_keys.htm${NC}"
    echo ""

    read -rp "   Enter B2_KEY_ID (keyID from Backblaze, press Enter to skip): " B2_KEY_ID
    if [ -n "$B2_KEY_ID" ]; then
      echo "$B2_KEY_ID" | npx wrangler secret put B2_KEY_ID --config "$TOML_PATH"
      ok "B2_KEY_ID stored securely in Cloudflare"
    else
      warn "B2_KEY_ID skipped"
    fi

    read -rp "   Enter B2_APP_KEY (applicationKey from Backblaze, press Enter to skip): " B2_APP_KEY
    if [ -n "$B2_APP_KEY" ]; then
      echo "$B2_APP_KEY" | npx wrangler secret put B2_APP_KEY --config "$TOML_PATH"
      ok "B2_APP_KEY stored securely in Cloudflare"
    else
      warn "B2_APP_KEY skipped"
    fi

    info "Secrets kisi bhi file mein save nahi hain — sirf Cloudflare encrypted vault mein"
  fi
}
set_secrets

# ─────────────────────────────────────────────
# STEP 6: Deploy Worker
# ─────────────────────────────────────────────
step "Deploying Cloudflare Worker..."
DEPLOY_OUT=$(npx wrangler deploy --config "$TOML_PATH" 2>&1)
echo "$DEPLOY_OUT"
WORKER_URL=$(echo "$DEPLOY_OUT" | grep -oE 'https://[a-z0-9-]+\.workers\.dev' | head -1)
if [ -n "$WORKER_URL" ]; then
  ok "Worker deployed: $WORKER_URL"
else
  warn "Could not auto-detect URL. Check Cloudflare Dashboard."
fi

# ─────────────────────────────────────────────
# STEP 7: Update .env.local
# ─────────────────────────────────────────────
finalize() {
  if [ -n "$WORKER_URL" ]; then
    step "Updating .env.local..."
    if [ -f ".env.local" ]; then
      if grep -q "NEXT_PUBLIC_B2_WORKER_URL" ".env.local"; then
        sed -i.bak "s|NEXT_PUBLIC_B2_WORKER_URL=.*|NEXT_PUBLIC_B2_WORKER_URL=\"$WORKER_URL\"|" ".env.local"
        rm -f ".env.local.bak"
      else
        echo "" >> ".env.local"
        echo "NEXT_PUBLIC_B2_WORKER_URL=\"$WORKER_URL\"" >> ".env.local"
      fi
      ok ".env.local updated"
    else
      echo "NEXT_PUBLIC_B2_WORKER_URL=\"$WORKER_URL\"" > ".env.local"
      ok ".env.local created"
    fi
  fi

  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║            ✅ Setup Complete!                        ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
  echo ""
  [ -n "$WORKER_URL" ] && echo -e "  🌐 Worker URL  : ${CYAN}$WORKER_URL${NC}"
  [ -n "$KV_ID" ]      && echo -e "  📦 KV Namespace: ${GRAY}$KV_ID${NC}"
  [ -n "$ACCOUNT_ID" ] && echo -e "  🔑 Account ID  : ${GRAY}$ACCOUNT_ID${NC}"
  echo ""
  echo -e "  ${YELLOW}⚡ Next Steps:${NC}"
  echo "  1. Vercel Dashboard → Settings → Environment Variables:"
  [ -n "$WORKER_URL" ] && echo -e "     NEXT_PUBLIC_B2_WORKER_URL = ${CYAN}$WORKER_URL${NC}"
  echo "  2. Backblaze B2 mein bucket banaaen: aalm-vastralay-media (Private)"
  echo "  3. Test: curl -I $WORKER_URL/test.jpg"
  echo ""
  echo -e "  ${GRAY}📖 Full guide: docs/b2-cloudflare-setup.md${NC}"
  echo ""
}
finalize
