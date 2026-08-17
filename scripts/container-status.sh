#!/bin/bash

CONTAINER="freedomops-api"

echo "=================================="
echo " FreedomOps Container Status"
echo "=================================="

if podman container exists "$CONTAINER"; then
    podman ps -a --filter "name=$CONTAINER"
else
    echo "Container $CONTAINER does not exist."
    exit 1
fi
