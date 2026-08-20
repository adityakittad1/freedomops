#!/usr/bin/env bash
# test-chat-tunnel.sh
curl -s -X POST https://pregnancy-ridge-wav-sitemap.trycloudflare.com/api/chat \
  -H 'Content-Type: application/json' \
  --data-raw '{"message":"Show me the status of freedomops-api"}' \
  --max-time 60
