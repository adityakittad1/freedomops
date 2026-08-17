#!/bin/bash

set -e

echo "=================================="
echo " FreedomOps Recovery"
echo "=================================="

if podman ps --format "{{.Names}}" | grep -qx "freedomops-api"; then
    echo "freedomops-api is already running."
else
    echo "Starting freedomops-api..."
    podman start freedomops-api
fi

echo
echo "Checking application..."

sleep 2

if curl -fsS http://localhost:8080 > /dev/null; then
    echo "Application is healthy."
else
    echo "Application is not responding."
    exit 1
fi
