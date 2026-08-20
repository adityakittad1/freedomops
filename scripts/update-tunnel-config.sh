#!/usr/bin/env bash
# =============================================================================
# update-tunnel-config.sh
#
# Detects the currently active Cloudflare Quick Tunnel, verifies it returns
# HTTP 200 on /api/health, then:
#   1. Updates public/config.js with the new URL
#   2. Commits and pushes to GitHub (Vercel auto-deploys within ~10s)
#
# Run this from the repo root whenever cloudflared is (re)started.
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_JS="${REPO_ROOT}/public/config.js"
HEALTH_PATH="/api/health"

echo ""
echo "========================================"
echo "  FreedomOps — Tunnel Auto-Updater"
echo "========================================"

# ── 1. Find cloudflared metrics server ────────────────────────────────────────
echo ""
echo "[1/4] Detecting active Cloudflare Quick Tunnel..."

TUNNEL_URL=""

# cloudflared metrics server listens on 127.0.0.1:<random-port>
# Find it by reading ss output
METRICS_PORT=$(ss -ltnp 2>/dev/null | grep cloudflared | grep -oP '127\.0\.0\.1:\K\d+' | head -1)

if [ -z "$METRICS_PORT" ]; then
    echo "ERROR: No cloudflared process is listening on any port."
    echo "       Start the tunnel first: cloudflared tunnel --url http://127.0.0.1:8000"
    exit 1
fi

echo "  Found cloudflared metrics at port: $METRICS_PORT"

QT_RESPONSE=$(curl -s --max-time 3 "http://127.0.0.1:${METRICS_PORT}/quicktunnel" 2>/dev/null)
TUNNEL_HOST=$(echo "$QT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('hostname',''))" 2>/dev/null)

if [ -z "$TUNNEL_HOST" ]; then
    echo "ERROR: Could not extract hostname from quicktunnel endpoint."
    echo "  Response was: $QT_RESPONSE"
    exit 1
fi

TUNNEL_URL="https://${TUNNEL_HOST}"
echo "  Detected tunnel URL: $TUNNEL_URL"

# ── 2. Verify tunnel ──────────────────────────────────────────────────────────
echo ""
echo "[2/4] Verifying tunnel responds to GET ${TUNNEL_URL}${HEALTH_PATH} ..."

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "${TUNNEL_URL}${HEALTH_PATH}" 2>/dev/null || echo "000")
RESPONSE_BODY=$(curl -s --max-time 8 "${TUNNEL_URL}${HEALTH_PATH}" 2>/dev/null || echo "")

echo "  HTTP Status: $HTTP_STATUS"
echo "  Response:    $RESPONSE_BODY"

if [ "$HTTP_STATUS" != "200" ]; then
    echo ""
    echo "ERROR: Tunnel is not responding correctly (HTTP $HTTP_STATUS)."
    echo "       Cloudflare tunnel may still be starting up. Wait 5 seconds and try again."
    exit 1
fi

# ── 3. Update public/config.js ────────────────────────────────────────────────
echo ""
echo "[3/4] Updating ${CONFIG_JS}..."

CURRENT_URL=$(grep -oP "apiBase: '\K[^']+" "$CONFIG_JS" 2>/dev/null || echo "")
echo "  Current URL in config.js:  $CURRENT_URL"
echo "  New URL:                   $TUNNEL_URL"

if [ "$CURRENT_URL" = "$TUNNEL_URL" ]; then
    echo "  config.js is already up to date. Skipping commit."
    echo ""
    echo "========================================"
    echo "  Nothing to update. Tunnel is live."
    echo "========================================"
    echo "  Frontend: https://freedomops.vercel.app/app/assistant"
    echo "  Backend:  ${TUNNEL_URL}${HEALTH_PATH}"
    exit 0
fi

# Replace the apiBase line in config.js
python3 -c "
import re, sys
path = sys.argv[1]
new_url = sys.argv[2]
content = open(path).read()
updated = re.sub(r\"apiBase: '[^']+'\", f\"apiBase: '{new_url}'\", content)
open(path, 'w').write(updated)
print('  config.js updated.')
" "$CONFIG_JS" "$TUNNEL_URL"

# ── 4. Commit and push ────────────────────────────────────────────────────────
echo ""
echo "[4/4] Committing and pushing to GitHub..."

cd "$REPO_ROOT"
git add public/config.js
git commit -m "chore: update active Cloudflare tunnel to ${TUNNEL_URL}"
git push origin master

echo ""
echo "========================================"
echo "  Done! Vercel auto-deploys in ~10s."
echo "========================================"
echo ""
echo "  Backend tunnel:  ${TUNNEL_URL}${HEALTH_PATH}"
echo "  Frontend:        https://freedomops.vercel.app/app/assistant"
echo ""
echo "  After 10-15 seconds, the UI should show:"
echo "    Online  ⚡ Qwen3"
