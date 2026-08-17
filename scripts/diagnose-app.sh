#!/bin/bash

CONTAINER="freedomops-api"
URL="http://localhost:8080"

echo "=================================="
echo " FreedomOps Application Diagnosis"
echo "=================================="

echo
echo "1. CONTAINER STATUS"
echo "----------------------------------"
podman ps -a --filter "name=$CONTAINER"

echo
echo "2. CONTAINER PROCESSES"
echo "----------------------------------"
if podman ps --format "{{.Names}}" | grep -qx "$CONTAINER"; then
    podman top "$CONTAINER"
else
    echo "Container is not running."
fi

echo
echo "3. RESOURCE METRICS"
echo "----------------------------------"
if podman ps --format "{{.Names}}" | grep -qx "$CONTAINER"; then
    podman stats --no-stream "$CONTAINER"
else
    echo "Container is not running."
fi

echo
echo "4. RECENT LOGS"
echo "----------------------------------"
podman logs --tail 20 "$CONTAINER"

echo
echo "5. APPLICATION HEALTH"
echo "----------------------------------"
if curl -fsS "$URL"; then
    echo
    echo "Health status: HEALTHY"
else
    echo
    echo "Health status: UNHEALTHY"
fi

echo
echo "=================================="
echo " Diagnosis collection complete."
echo "=================================="
