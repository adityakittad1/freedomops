#!/bin/bash

CONTAINER="freedomops-api"

echo "=================================="
echo " FreedomOps Container Logs"
echo "=================================="

if podman container exists "$CONTAINER"; then
    podman logs --tail 50 "$CONTAINER"
else
    echo "Container $CONTAINER does not exist."
    exit 1
fi
