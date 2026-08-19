#!/bin/bash

cd ~/freedomops

export OLLAMA_URL="http://$(ip route | awk '/default/ {print $3}'):11434"

echo "Checking Ollama..."
curl --max-time 10 "$OLLAMA_URL/api/tags" >/dev/null || {
    echo "ERROR: Ollama is not reachable."
    echo "Start Ollama on Windows first."
    exit 1
}

echo "Ollama: OK"
echo "Starting FreedomOps FastAPI..."

exec python3 -m uvicorn backend.main:app \
    --host 127.0.0.1 \
    --port 8000
