#!/usr/bin/env bash
# test-chat.sh — fires a real /api/chat request against the local backend
curl -s -X POST http://127.0.0.1:8000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Show me the status of freedomops-api"}' \
  --max-time 60
