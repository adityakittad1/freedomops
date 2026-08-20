#!/usr/bin/env bash
# detect-tunnel.sh — discovers the active Cloudflare Quick Tunnel URL
# by querying the cloudflared local metrics server for each running process.
# Prints the URL and verifies /api/health responds 200.

set -euo pipefail

HEALTH_PATH="/api/health"
ACTIVE_URL=""

echo "[detect-tunnel] Scanning running cloudflared processes..."

for pid in $(pgrep -x cloudflared 2>/dev/null); do
    echo "[detect-tunnel] Checking PID $pid..."

    # cloudflared exposes a local metrics HTTP server.
    # Default port is 2000, but it increments if taken. Try 2000-2010.
    for port in $(seq 2000 2010); do
        metrics_url="http://127.0.0.1:${port}/metrics"
        # Try to grab quick tunnel URL from the metrics/ready endpoint
        ready=$(curl -s --max-time 1 "http://127.0.0.1:${port}/ready" 2>/dev/null || true)
        if echo "$ready" | grep -q "cloudflare"; then
            echo "[detect-tunnel] Metrics server found on port $port for PID $pid"
            # Get the tunnel URL from the internal API
            tunnel_info=$(curl -s --max-time 2 "http://127.0.0.1:${port}/quicktunnel" 2>/dev/null || true)
            if [ -n "$tunnel_info" ]; then
                url=$(echo "$tunnel_info" | python3 -c "import sys,json; d=json.load(sys.stdin); print('https://' + d.get('hostname',''))" 2>/dev/null || true)
                if [ -n "$url" ] && [ "$url" != "https://" ]; then
                    echo "[detect-tunnel] Found URL: $url"
                    ACTIVE_URL="$url"
                fi
            fi
        fi
    done
done

# If we found a URL via metrics, verify /api/health
if [ -n "$ACTIVE_URL" ]; then
    echo ""
    echo "[detect-tunnel] Verifying $ACTIVE_URL$HEALTH_PATH ..."
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$ACTIVE_URL$HEALTH_PATH" 2>/dev/null || echo "000")
    body=$(curl -s --max-time 5 "$ACTIVE_URL$HEALTH_PATH" 2>/dev/null || echo "error")
    echo "[detect-tunnel] HTTP Status: $status"
    echo "[detect-tunnel] Response Body: $body"
    if [ "$status" = "200" ]; then
        echo ""
        echo "ACTIVE_TUNNEL_URL=$ACTIVE_URL"
        exit 0
    fi
fi

# Fallback: probe all candidate trycloudflare domains from /etc/hosts or dig
# Instead, scan for known-registered quick tunnel by querying each cloudflared's
# local log output or the connection register endpoint.
echo "[detect-tunnel] Metrics scan found nothing. Trying /tunnel endpoint on metrics ports..."

for port in $(seq 2000 2015); do
    info=$(curl -s --max-time 1 "http://127.0.0.1:${port}/quicktunnel" 2>/dev/null || true)
    if [ -n "$info" ]; then
        url=$(echo "$info" | python3 -c "import sys,json; d=json.load(sys.stdin); print('https://' + d.get('hostname',''))" 2>/dev/null || true)
        if [ -n "$url" ] && [ "$url" != "https://" ]; then
            echo "[detect-tunnel] Found at port $port: $url"
            status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${url}${HEALTH_PATH}" 2>/dev/null || echo "000")
            body=$(curl -s --max-time 5 "${url}${HEALTH_PATH}" 2>/dev/null || echo "error")
            echo "[detect-tunnel] HTTP Status: $status"
            echo "[detect-tunnel] Response Body: $body"
            if [ "$status" = "200" ]; then
                echo ""
                echo "ACTIVE_TUNNEL_URL=$url"
                exit 0
            fi
        fi
    fi
done

echo ""
echo "[detect-tunnel] No active tunnel found that responds to $HEALTH_PATH."
echo "[detect-tunnel] Make sure cloudflared is running: cloudflared tunnel --url http://127.0.0.1:8000"
exit 1
