#!/bin/bash

CONTAINER="freedomops-api"
URL="http://localhost:8080"

echo "=================================="
echo " FreedomOps Application Recovery"
echo "=================================="

STATUS=$(podman inspect "$CONTAINER" --format '{{.State.Status}}' 2>/dev/null || true)

echo "Current container state: $STATUS"

if [ "$STATUS" = "running" ]; then
    echo "Container is already running."
else
    echo "Starting $CONTAINER..."
    podman start "$CONTAINER"
fi

echo "Waiting for application..."
sleep 2

if curl -fsS "$URL" > /tmp/freedomops-recovery.txt; then
    echo "Recovery successful."
    echo "Application response:"
    cat /tmp/freedomops-recovery.txt
else
    echo "Recovery failed."
    exit 1
fi
