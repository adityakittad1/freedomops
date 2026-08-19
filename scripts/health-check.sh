#!/bin/bash

URL="http://127.0.0.1:8080"

echo "=================================="
echo " FreedomOps Application Health"
echo "=================================="

if curl -fsS "$URL" > /tmp/freedomops-health.txt; then
    echo "Status: HEALTHY"
    echo "Response:"
    cat /tmp/freedomops-health.txt
else
    echo "Status: UNHEALTHY"
    echo "Application is not responding at $URL"
    exit 1
fi
